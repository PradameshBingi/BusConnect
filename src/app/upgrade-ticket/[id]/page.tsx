
/**
 * @fileOverview Redirects legacy dynamic paths to the standardized query-parameter based upgrade view.
 */

export default function UpgradeIDPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Preparing Upgrade...</h2>
      <p className="text-muted-foreground">Redirecting to the ticket upgrade portal.</p>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            if (id && id !== 'view' && id !== '[id]') {
              window.location.href = '/upgrade-ticket?id=' + id;
            } else {
              window.location.href = '/booking-history';
            }
          `,
        }}
      />
    </div>
  );
}
