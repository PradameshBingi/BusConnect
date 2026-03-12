
/**
 * @fileOverview Placeholder page for dynamic ticket routes to satisfy static export requirements.
 * Redirects to the query-parameter based ticket view.
 */

export function generateStaticParams() {
  // Satisfy Next.js build requirement for static export by providing a dummy path
  return [{ id: 'view' }];
}

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
            if (id && id !== 'view') {
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
