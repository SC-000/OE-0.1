import BillingsWebhookController from './BillingsWebhookController'
import GatewayController from './GatewayController'
import Console from './Console'
import Admin from './Admin'
import Settings from './Settings'

const Controllers = {
    BillingsWebhookController: Object.assign(BillingsWebhookController, BillingsWebhookController),
    GatewayController: Object.assign(GatewayController, GatewayController),
    Console: Object.assign(Console, Console),
    Admin: Object.assign(Admin, Admin),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers