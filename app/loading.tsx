/**
 * Route-level loading UI: the moment a navigation starts, the destination
 * paints this instead of a blank frame, so a click always feels acknowledged
 * and the incoming page appears the instant it is ready.
 */
export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__pulse" aria-hidden />
      Loading
    </div>
  );
}
