
/**
 * @fileOverview Redirects legacy dynamic paths to the standardized query-parameter based ticket view.
 */

export default function TicketIDPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Accessing Ticket...</h2>
      <p className="text-muted-foreground">Please wait while we load your digital ticket details.</p>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Extract ID from path and redirect to query param version
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            if (id && id !== 'view' && id !== '[id]') {
              window.location.href = '/ticket?id=' + id;
            } else {
              window.location.href = '/select-ticket-type';
            }
          `,
        }}
      />
    </div>
  );
}
