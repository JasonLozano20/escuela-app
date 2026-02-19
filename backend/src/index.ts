import 'dotenv/config';
import prisma from './utils/database';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import documentoRoutes from './routes/documento.routes';

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/documentos', documentoRoutes)

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Backend funcionando',
        timestamp: new Date().toISOString()
    });
});

async function testConnection(){
    try{
        await prisma.$connect();
        console.log('conectado a mariaDB');

        const UserCount = await prisma.usuario.count();
        console.log(`Usuarios en DB: ${UserCount}`);
    }catch (error){
        console.error('Error conectando a mariaDB:', error);
    }
}

testConnection();

app.listen(PORT, () =>{
    console.log(`servidor en http://localhost:${PORT}`);
});