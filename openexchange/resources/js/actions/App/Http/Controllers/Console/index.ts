import DashboardController from './DashboardController'
import UsageController from './UsageController'
import SourcesController from './SourcesController'
import BillingController from './BillingController'

const Console = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    UsageController: Object.assign(UsageController, UsageController),
    SourcesController: Object.assign(SourcesController, SourcesController),
    BillingController: Object.assign(BillingController, BillingController),
}

export default Console