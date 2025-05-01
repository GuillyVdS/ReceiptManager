import { useState } from 'react'
import { Menu } from './components/Menu/Menu';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [exit, setExit] = useState(false);

  const handleExit = () => {
    console.log('Goodbye!');
    setExit(true); // Trigger exit
  };

  if (exit) {
    return (
      <div className="App">
        <h1>App has exited.</h1> {/* Optionally, show exit message */}
      </div>
    );
  }


  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Menu onExit={handleExit} /> {/* Render the Menu */}
      </QueryClientProvider>
    </>
  )
}

export default App
