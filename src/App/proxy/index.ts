import { Container, Service } from 'typedi';
import { ProxyServer } from '../../ProxyServer';
import { actualRequest, endPoint, host, ip, rule, user } from '../middleware';
import PluginManager from '../plugin-manager';
import {
  HostService,
  HttpTrafficService,
  MockDataService,
  ProfileService,
  RuleService,
} from '../services';

@Service()
export class Proxy {
  private server: ProxyServer;

  public async listen(port?) {
    this.server.listen(port);
  }

  public async init() {
    this.server = await ProxyServer.create();
    this.server.use(ip());
    this.server.use(user(Container.get(ProfileService)));
    this.server.use(endPoint(Container.get(HttpTrafficService)));
    this.server.use(
      rule({
        mockDataService: Container.get(MockDataService),
        profileService: Container.get(ProfileService),
        ruleService: Container.get(RuleService),
      }),
    );
    this.server.use(
      host(Container.get(HostService), Container.get(ProfileService)),
    );
    this.server.use(actualRequest(Container.get(HttpTrafficService)));
    const pluginManager: PluginManager = Container.get(PluginManager);
    pluginManager.loadProxyMiddleware(this.server);
  }
}
