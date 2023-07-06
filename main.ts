
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";
import { Status, STATUS_TEXT } from "https://deno.land/std@0.192.0/http/http_status.ts";
import { mkitems } from "./mkitems.js";

const config = JSON.parse(await Deno.readTextFile('config.json'));

function getdata() {
    const data = mkitems();
    let datastr = JSON.stringify(data);
    console.log(`data.json dynamically generated and have ${Object.keys(data).length} keys`);
    if (config.omit_date_self)
        //FIXME: bad trick
        datastr = datastr.replace(/(%date，)?(%self)/g, '公司');
    return datastr;
}

const data = Deno.env.get('PRODUCTION') ? getdata() : null;

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
        return new Response(data ?? getdata());
    }
    return serveDir(request, {
        fsRoot: 'www'
    });
}, {
    hostname: config.host,
    port: config.port
});
