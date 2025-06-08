import * as saws from "@stackattack/aws";

export default () => {
  const ctx = saws.context();

  const vpc = saws.vpc(ctx);
  const vpn = saws.vpn(ctx, vpc);

  const camFeenstraCertificate = saws.certificate(ctx.prefix('camfeenstra'), {
    domain: 'camfeenstra.com',
    noValidate: true,
    wildcard: true,
  });

  const loadBalancer = saws.loadBalancer(ctx, {
    network: vpc.network("public"),
    certificate: camFeenstraCertificate,
  });

  const cluster = saws.cluster(ctx, {
    network: vpc.network("private"),
    instances: {
      architecture: "arm64",
      memoryMib: { min: 4096, max: 8192 },
      vcpuCount: { min: 2, max: 4 },
      memoryGibPerVcpu: { min: 2, max: 2 }
    },
  });
  const database = saws.database(ctx, { network: vpc.network("private") });

  const redis = saws.redis(ctx, { network: vpc.network("private") });

  return {
    clientConfig: vpn.clientConfig,
    cluster: saws.clusterToIds(cluster),
    loadBalancer: saws.loadBalancerToIds(loadBalancer),
    vpc: saws.vpcToIds(vpc),
    database: saws.databaseToIds(database),
    redisUrl: redis.url,
    camFeenstraCertificate
  };
};
