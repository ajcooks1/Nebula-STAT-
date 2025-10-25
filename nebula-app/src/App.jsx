import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient' // Import your client

function App() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    // This is an async function to fetch data
    async function getRequests() {
      // 'from' the 'requests' table, 'select' all columns '*'
      const { data, error } = await supabase
        .from('requests')
        .select('*')

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        console.log('Data fetched!', data)
        setRequests(data)
      }
    }

    getRequests()
  }, [])

  return (
    <div>
      <h1>Nebula PM App</h1>
      <p>Open your browser's developer console (F12) to see the data.</p>
      <pre>{JSON.stringify(requests, null, 2)}</pre>
    </div>
  )
}

export default App