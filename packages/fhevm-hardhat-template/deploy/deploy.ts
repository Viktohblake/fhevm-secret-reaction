import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

// postDeploy helper under scripts/utils.
import { postDeploy } from "../../postDeploy";

const func: DeployFunction = async ( hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network} = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const res = await deploy("SecretReactions", { from: deployer, log: true, autoMine: true });
  log(`SecretReactions deployed at ${res.address} on ${network.name}`);

  // this generates site/abi/<Contract>ABI.ts and <Contract>Addresses.ts
  await postDeploy(network.name, "SecretReactions");
};

export default func;
func.tags = ["SecretReactions"];
