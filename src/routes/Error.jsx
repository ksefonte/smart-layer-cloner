import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p variant="h4">Oops!</p>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>{error.statusText || error.message}</p>
      <Link href="/">Go Home</Link>
    </Box>
  );
}