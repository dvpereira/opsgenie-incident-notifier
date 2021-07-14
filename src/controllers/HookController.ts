import { Request, Response } from 'express';
import { Hook } from '../interfaces/Hook';
import SlackService from '../services/SlackService';

const slackService = new SlackService();

export default{
    async notify(req: Request, res: Response): Promise<Response> {
        try{
            const hook: Hook = req.body
            await slackService.notify(hook);
        } catch(error){
            console.error(error)
            return res.status(500).send(`Service unavailable...`)
        }
       
        return  res.status(200).send()
    }
}
   