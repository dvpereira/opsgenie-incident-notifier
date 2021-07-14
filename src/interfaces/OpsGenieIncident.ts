export interface OpsGenieIncident {
    data : {
        id: string
        tinyId: string
        message: string
        status: string
        tags: string[]
        createdAt: string
        updatedAt: string
        priority: string
        responders: [
            { 
                id: string
                type: string

            }
        ]
        impactedServices: string[]
        extraProperties: {
            
        }
    }
}