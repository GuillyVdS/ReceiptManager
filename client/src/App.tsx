import { useState } from 'react'
import { Menu } from './components/Menu/Menu';
import './App.css'

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
      <Menu onExit={handleExit} /> {/* Render the Menu */}
    </>
  )
}

export default App
