import { useState } from 'react'
import { Menu } from './components/Menu/Menu';
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        <h1>App has exited.</h1>
      </div>
    );
  }


  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Menu onExit={handleExit} />
        <ToastContainer />
      </QueryClientProvider>
    </>
  )
}

export default App
