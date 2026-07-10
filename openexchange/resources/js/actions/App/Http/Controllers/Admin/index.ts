import ImpersonationController from './ImpersonationController'
import DashboardController from './DashboardController'
import ClientsController from './ClientsController'
import ModelsController from './ModelsController'
import RatesController from './RatesController'
import ChargesController from './ChargesController'
import PlatformController from './PlatformController'
import AuditController from './AuditController'

const Admin = {
    ImpersonationController: Object.assign(ImpersonationController, ImpersonationController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    ClientsController: Object.assign(ClientsController, ClientsController),
    ModelsController: Object.assign(ModelsController, ModelsController),
    RatesController: Object.assign(RatesController, RatesController),
    ChargesController: Object.assign(ChargesController, ChargesController),
    PlatformController: Object.assign(PlatformController, PlatformController),
    AuditController: Object.assign(AuditController, AuditController),
}

export default Admin