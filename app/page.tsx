import dynamic from "next/dynamic";

// For the entire application to render on the client side
const App = dynamic(() => import("./app"), { ssr: false });

export default App;
