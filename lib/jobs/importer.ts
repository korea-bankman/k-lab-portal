import { createAdminClient } from "@/lib/supabase/admin";

type ImportedJob = {
  sourceName: string;
  sourceBaseUrl: string;
  hospitalName: string;
  department: string;
  region: string;
  experience: string;
  employmentType: string;
  deadline: string;
  originalUrl: string;
  description: string;
};

type ImportSourceResult = {
  source: string;
  fetched: number;
  inserted: number;
  skipped: number;
  error?: string;
};

export type ImportJobsResult = {
  keyword: string;
  startedAt: string;
  finishedAt: string;
  totalFetched: number;
  totalInserted: number;
  totalSkipped: number;
  sources: ImportSourceResult[];
};

const DEFAULT_KEYWORD = "임상병리사";

function toText(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeDeadline(value: unknown) {
  const text = toText(value);
  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 90);
  return fallback.toISOString().slice(0, 10);
}

function normalizeRegion(value: unknown) {
  const text = toText(value, "전국");
  const first = text.split(/[>,/]/)[0]?.trim();
  return first || text || "전국";
}

function buildDescription(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

async function fetchJson(url: URL) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "K-Lab Portal Job Importer"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

async function fetchText(url: URL) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/xml,text/xml,*/*",
      "User-Agent": "K-Lab Portal Job Importer"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function getXmlTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXmlEntities(match[1].trim()) : "";
}

function getXmlBlocks(xml: string, tagName: string) {
  return Array.from(xml.matchAll(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "gi"))).map((match) => match[1]);
}

function throwXmlApiErrorIfNeeded(xml: string) {
  const error = getXmlTag(xml, "error");
  const message = getXmlTag(xml, "message");
  const messageCd = getXmlTag(xml, "messageCd");

  if (error) {
    throw new Error(error);
  }

  if (message && messageCd && messageCd !== "000") {
    throw new Error(message);
  }
}

async function fetchSaraminJobs(keyword: string): Promise<ImportedJob[]> {
  const accessKey = process.env.SARAMIN_ACCESS_KEY?.trim();
  if (!accessKey) return [];

  const url = new URL("https://oapi.saramin.co.kr/job-search");
  url.searchParams.set("access-key", accessKey);
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("count", "100");
  url.searchParams.set("sort", "pd");
  url.searchParams.set("fields", "posting-date,expiration-date");

  const payload = await fetchJson(url);
  const jobs = toArray((payload as { jobs?: { job?: unknown | unknown[] } })?.jobs?.job);

  return jobs.map((item) => {
    const job = item as {
      id?: string | number;
      url?: string;
      company?: { detail?: { name?: string } };
      position?: {
        title?: string;
        location?: { name?: string };
        "job-type"?: { name?: string };
        "experience-level"?: { name?: string };
      };
      "expiration-date"?: string;
      keyword?: string;
    };
    const title = toText(job.position?.title, keyword);

    return {
      sourceName: "사람인",
      sourceBaseUrl: "https://www.saramin.co.kr",
      hospitalName: toText(job.company?.detail?.name, "병원명 미확인"),
      department: title.includes("임상병리") ? "임상병리사" : keyword,
      region: normalizeRegion(job.position?.location?.name),
      experience: toText(job.position?.["experience-level"]?.name, "경력무관"),
      employmentType: toText(job.position?.["job-type"]?.name, "고용형태 미확인"),
      deadline: normalizeDeadline(job["expiration-date"]),
      originalUrl: toText(job.url, `https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=${job.id ?? ""}`),
      description: buildDescription([title, toText(job.keyword)])
    };
  }).filter((job) => job.originalUrl);
}

async function fetchWorknetJobs(keyword: string): Promise<ImportedJob[]> {
  const authKey = process.env.WORKNET_API_KEY?.trim();
  if (!authKey) return [];

  const endpoint = process.env.WORKNET_API_URL?.trim() || "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do";
  const url = new URL(endpoint);
  url.searchParams.set("authKey", authKey);
  url.searchParams.set("callTp", "L");
  url.searchParams.set("returnType", "XML");
  url.searchParams.set("startPage", "1");
  url.searchParams.set("display", "100");
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("sortOrderBy", "DESC");

  const payload = await fetchText(url);
  throwXmlApiErrorIfNeeded(payload);
  const jobs = getXmlBlocks(payload, "wanted");

  return jobs.map((item) => {
    const wantedAuthNo = getXmlTag(item, "wantedAuthNo");
    const title = getXmlTag(item, "title");
    const originalUrl = getXmlTag(item, "wantedInfoUrl") || (wantedAuthNo ? `https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do?wantedAuthNo=${wantedAuthNo}` : "");
    const employmentType = getXmlTag(item, "empTpNm") || getXmlTag(item, "holidayTpNm");

    return {
      sourceName: "고용24",
      sourceBaseUrl: "https://www.work24.go.kr",
      hospitalName: toText(getXmlTag(item, "company"), "병원명 미확인"),
      department: "임상병리사",
      region: normalizeRegion(getXmlTag(item, "region")),
      experience: toText(getXmlTag(item, "career"), "경력무관"),
      employmentType: toText(employmentType, "고용형태 미확인"),
      deadline: normalizeDeadline(getXmlTag(item, "closeDt")),
      originalUrl,
      description: buildDescription([title || keyword, getXmlTag(item, "salTpNm"), getXmlTag(item, "sal")])
    };
  }).filter((job) => job.originalUrl);
}

async function ensureJobSource(sourceName: string, sourceBaseUrl: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase service role 환경변수가 필요합니다.");

  const { data: existing } = await supabase
    .from("job_sources")
    .select("id")
    .eq("name", sourceName)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("job_sources")
    .insert({
      name: sourceName,
      base_url: sourceBaseUrl,
      api_ready: true,
      last_synced_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message || `${sourceName} 소스를 만들지 못했습니다.`);
  return data.id as string;
}

async function saveJobs(jobs: ImportedJob[]) {
  if (jobs.length === 0) return { inserted: 0, skipped: 0 };

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase service role 환경변수가 필요합니다.");

  const sourceIdByName = new Map<string, string>();
  for (const job of jobs) {
    if (!sourceIdByName.has(job.sourceName)) {
      sourceIdByName.set(job.sourceName, await ensureJobSource(job.sourceName, job.sourceBaseUrl));
    }
  }

  const originalUrls = jobs.map((job) => job.originalUrl);
  const { data: existingRows } = await supabase
    .from("jobs")
    .select("original_url")
    .in("original_url", originalUrls);

  const existingUrls = new Set((existingRows ?? []).map((row) => row.original_url as string));
  const rows = jobs
    .filter((job) => !existingUrls.has(job.originalUrl))
    .map((job) => ({
      hospital_name: job.hospitalName,
      department: job.department,
      region: job.region,
      experience: job.experience,
      employment_type: job.employmentType,
      deadline: job.deadline,
      original_url: job.originalUrl,
      source_id: sourceIdByName.get(job.sourceName),
      description: job.description
    }));

  if (rows.length === 0) return { inserted: 0, skipped: jobs.length };

  const { error } = await supabase.from("jobs").insert(rows);
  if (error) throw new Error(error.message);

  for (const sourceId of sourceIdByName.values()) {
    await supabase.from("job_sources").update({ last_synced_at: new Date().toISOString() }).eq("id", sourceId);
  }

  return { inserted: rows.length, skipped: jobs.length - rows.length };
}

async function importFromSource(source: string, fetcher: () => Promise<ImportedJob[]>): Promise<ImportSourceResult> {
  try {
    const jobs = await fetcher();
    const saved = await saveJobs(jobs);

    return {
      source,
      fetched: jobs.length,
      inserted: saved.inserted,
      skipped: saved.skipped
    };
  } catch (error) {
    return {
      source,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : "알 수 없는 오류"
    };
  }
}

export async function importClinicalLabJobs(): Promise<ImportJobsResult> {
  const keyword = process.env.JOB_IMPORT_KEYWORD?.trim() || DEFAULT_KEYWORD;
  const startedAt = new Date().toISOString();
  const sources = await Promise.all([
    importFromSource("고용24", () => fetchWorknetJobs(keyword)),
    importFromSource("사람인", () => fetchSaraminJobs(keyword))
  ]);

  return {
    keyword,
    startedAt,
    finishedAt: new Date().toISOString(),
    totalFetched: sources.reduce((sum, source) => sum + source.fetched, 0),
    totalInserted: sources.reduce((sum, source) => sum + source.inserted, 0),
    totalSkipped: sources.reduce((sum, source) => sum + source.skipped, 0),
    sources
  };
}
