import URL from 'url';
import { HostService, ProfileService } from '../services';

export const host = (
  hostService: HostService,
  profileService: ProfileService,
) => {
  return async (ctx, next) => {
    if (!profileService.enableHost(ctx.userID)) {
      await next();
      return;
    }
    const { req, res } = ctx;
    if (res.body) {
      await next();
      return;
    }
    const url = URL.parse(req.url);
    url.hostname = await hostService.resolveHost(ctx.userID, url.hostname);
    url.host = url.hostname;
    if (url.port) {
      url.host = `${url.host}:${url.port}`;
    }
    req.url = URL.format(url);
    await next();
  };
};
