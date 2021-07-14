import { Router } from 'express';
import HookController from './controllers/HookController';

const routes = Router();

routes.get('/health', (req, res) => {
    return res.send('UP')
});

routes.post('/incident', HookController.notify)

export default routes;