import { dashboardPasswordFile } from '../file-models/dashboard-password'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const dashboardCredentials = sdk.Action.withoutInput(
  'dashboard-credentials',
  async () => ({
    name: i18n('Dashboard Credentials'),
    description: i18n(
      'Display the generated credentials for the DATUM monitoring dashboard.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Monitoring'),
    visibility: 'enabled',
  }),
  async () => {
    const password = await dashboardPasswordFile.read().once()
    if (!password) {
      throw new Error(i18n('The dashboard password has not been generated'))
    }

    return {
      version: '1',
      title: i18n('DATUM Dashboard Credentials'),
      message: i18n(
        'Use these credentials when the dashboard requests authentication.',
      ),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: 'admin',
            copyable: true,
            masked: false,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: password,
            copyable: true,
            masked: true,
            qr: false,
          },
        ],
      },
    }
  },
)
