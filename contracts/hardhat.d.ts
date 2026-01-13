import "hardhat/types/runtime";
import "hardhat/types/config";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: any;
    run: any;
  }
  
  interface NetworkManager {
    name: string;
    config: any;
  }
}