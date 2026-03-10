const express = require('express')
const cors = require('cors')
const supabase = require('./config/supabase') // Importar el cliente de supabase

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ message: 'API Kodo Takai funcionando 🚀' })
})

// Ruta de ejemplo para probar la conexión a Supabase
app.get('/test-db', async (req, res) => {
    try {
        // Realiza una consulta a una tabla (cambia 'tu_tabla' por una real)
        const { data, error } = await supabase.from('tu_tabla').select('*').limit(1)
        
        if (error) throw error
        
        res.json({ message: 'Conexión a Supabase exitosa ✅', data })
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar con Supabase', details: error.message })
    }
})

module.exports = app
