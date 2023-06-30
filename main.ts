
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";
import { Status, STATUS_TEXT } from "https://deno.land/std@0.192.0/http/http_status.ts";
import { ITEMS } from "./mkitems.js";

const data = JSON.stringify(ITEMS);
console.log(`data.json dynamically generated and have ${Object.keys(data).length} keys`);

serve(function (request: Request) {
    const url = new URL(request.url);
    if (!['HEAD', 'GET', 'POST'].includes(request.method))
        return new Response(null, {
            status: Status.MethodNotAllowed,
            statusText: STATUS_TEXT[Status.MethodNotAllowed]
        });
    const pathname = url.pathname;
    if (/\.(ts|jsx|tsx|tsm|exe|msi|chm|bat|cmd|php|jsp|aspx?)$/.test(pathname) || pathname.includes('/..')) {
        return new Response(null, {
            status: Status.Teapot,
            statusText: STATUS_TEXT[Status.Teapot]
        });
    }
    if (pathname === '/data.json') {
        console.log('Served dynamic data.json');
        return new Response(data);
    }
    return serveDir(request, {
        fsRoot: 'www'
    });
});
