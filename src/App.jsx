import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/Root";
import Error from "./routes/Error";
import Home from "./routes/Home";
import Settings from "./routes/Settings";
import TemplateManager from "./routes/TemplateManager";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      { path: "template-manager", element: <TemplateManager /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}