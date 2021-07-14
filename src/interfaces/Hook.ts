export interface Hook {
    action: string
    alert : {
        alertId: string
        message: string
        tags: string[]
        tinyId: string
        entity: string
        alias: string
        createdAt: bigint
        updatedAt: bigint
        username: string
        userId: string
        note: string
        description: string
        team: string
        responders: [
            { 
                id: string
                type: string
                name: string

            }
        ]
        teams: string[]
        details: {
            'incident-alert-type': string
            'incident-id': string
            key: string
        }
        priority: string
        source: string
    }
    source : {
        name: string
        type: string
    }
    integrationName: string
    integrationId: string
    integrationType: string
}