import { OpsGenieIncident } from '../interfaces/OpsGenieIncident'
import { OpsGenieService } from '../interfaces/OpsGenieService'
import { OpsGenieTeam } from '../interfaces/OpsGenieTeam'
import HttpClient from './HttpService'
import { AxiosRequestConfig } from 'axios'

const opsGenieApiKey = process.env.OPSGENIE_API_KEY || ``

class OpsGenieController extends HttpClient {
    public constructor() {
        super('https://api.opsgenie.com/v1')

        this._initializeRequestInterceptor()
    }

    private _initializeRequestInterceptor = () => {
        this.instance.interceptors.request.use(
          this._handleRequest,
          this._handleError,
        );
      };
    
      private _handleRequest = (config: AxiosRequestConfig) => {
        config.headers['Authorization'] = `GenieKey ${opsGenieApiKey}`
    
        return config;
      };

    public getIncident = (id: string) => this.instance.get<OpsGenieIncident>(`/incidents/${id}`)

    public getService = (id: string) => this.instance.get<OpsGenieService>(`services/${id}`)

    public getTeam = (id: string) => this.instance.get<OpsGenieTeam>(`teams/${id}`)

  async getOpsGenieIncident(incident_id: string){
      try {
          let opsGenieIncident = await this.getIncident(incident_id)
          console.log(opsGenieIncident.data)
          return opsGenieIncident
      } catch (error) {
          console.error(error)
      }
  }

  async getOpsGenieService(service_id: string){
      try {
          let opsGenieService = await this.getService(service_id)
          console.log(opsGenieService.data)
          return opsGenieService
      } catch (error) {
          console.error(error)
      }
  }

  async getOpsGenieTeam(team_id: string){
    try {
        let opsGenieTeam = await this.getTeam(team_id)
        console.log(opsGenieTeam.data)
        return opsGenieTeam
    } catch (error) {
        console.error(error)
    }
  }
}

export default OpsGenieController