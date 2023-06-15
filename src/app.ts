import { serve } from "https://deno.land/std/http/server.ts";

const db = await Deno.openKv();

await serve((req) => {
  const url = new URL(req.url);
  if (url.pathname.length <= 5) {
    return new Response("error", { status: 400 });
  }
  if (url.pathname.startsWith("/set/")) {
    return set(url.pathname.replace("/set/", ""));
  } else if (url.pathname.startsWith("/get/")) {
    return get(url.pathname.replace("/get/", ""));
  }
  return new Response("not found", { status: 404 });
});

async function set(value: string): Promise<Response> {
  try {
    const _url = new URL(value);
  } catch (_) {
    return new Response("seems like it is not an url", { status: 400 });
  }

  const id = await setUrl(value);
  console.log("SET", id, value);
  return new Response(id, { status: 200 });
}

async function get(id: string): Promise<Response> {
  const url = await findUrl(id);
  if (url === null) {
    return new Response("not found", { status: 404 });
  }
  console.log("GET", id, url);
  return new Response(url, { status: 200 });
}

async function findUrl(id: string): Promise<string | null> {
  const result = await db.get<string>(["url", id]);
  return result.value;
}

async function setUrl(url: string): Promise<string> {
  const search = await db.get<string>(["url", url]);
  if (search.value !== null) {
    return search.value;
  }
  const id = makeid(10);
  const res = await db.set(["url", id], url);
  console.log(res);
  return id;
}

function makeid(length: number): string {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
