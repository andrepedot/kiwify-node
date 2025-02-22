import express from 'express';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const secret = process.env.SECRET_KW_TOKEN;
// Configurando Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware para processar JSON
app.use(express.json());

// Rota para o webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }),
    async (req, res) => {
        console.log("BODY: ", req.body)
        // receive order's data
        let order = {};
        try {
            order = JSON.parse(req.body);
        } catch (error) {
            return res.status(400).send({ error });
        }

        // verify signature
        const { signature } = req.query;
        const calculatedSignature = crypto.createHmac('sha1', secret)
            .update(JSON.stringify(order)).digest('hex');
        if (signature !== calculatedSignature) {
            return res.status(400).send({ error: 'Incorrect signature' });
        }

        // do any job with received order's data
        console.log('Received order:', order);

        // return success response
        return res.status(200).send({ status: 'ok' })
    });
// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`🚀 Webhook rodando em http://localhost:${PORT}`);
});
