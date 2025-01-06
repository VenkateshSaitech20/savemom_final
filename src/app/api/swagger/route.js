export async function GET() {
    const swaggerHtml = `
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
    <script src="/swagger-ui/swagger-ui-bundle.js" type="text/javascript"></script>
    <script src="/swagger-ui/swagger-ui-standalone-preset.js" type="text/javascript"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIStandalonePreset,
                    SwaggerUIBundle.presets.apis,
                ],
                layout: 'StandaloneLayout',
                onComplete: function() {
                    const originalAuthorize = ui.authActions.authorize.bind(ui.authActions);
                    ui.authActions.authorize = function(auth) {
                        originalAuthorize(auth);
                        if (auth.BearerAuth && auth.BearerAuth.value) {
                            const token = auth.BearerAuth.value;
                            ui.preauthorizeApiKey('BearerAuth', token);
                        } else {
                            console.error("Bearer token not found in authorization object");
                        }
                    };
                }
            });
            window.ui = ui;
        };
    </script>
</head>
<body>
    <div id="swagger-ui"></div>
</body>
</html>
    `;

    return new Response(swaggerHtml, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
