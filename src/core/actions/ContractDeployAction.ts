import { MainApi } from '../api/main-api';
import { Contract } from '../contracts/Contract';
import { poll } from '../helpers/util';
import {
    ContractDeploymentRequest,
    RequestStatus,
} from '../types';

export class ContractDeployAction {

    private readonly deploymentRequest: ContractDeploymentRequest;

    constructor(deploymentRequest: ContractDeploymentRequest) {
        this.deploymentRequest = deploymentRequest;
    }

    get actionUrl(): string {
        return this.deploymentRequest.redirect_url;
    }

    get status(): RequestStatus {
        return this.deploymentRequest.status;
    }
    
    get transactionHash(): string | undefined {
        return this.deploymentRequest.deploy_tx.tx_hash;
    }

    get transactionCaller(): string | undefined {
        return this.deploymentRequest.deployer_address;
    }
    
    public awaitResult(): Promise<Contract> {
        return new Promise((resolve, reject) => {
            poll<ContractDeploymentRequest>(
                () =>
                    MainApi.instance().fetchContractDeploymentRequestById(this.deploymentRequest.id),
                    (response) => response.status === RequestStatus.PENDING
            ).then(result => {
                resolve(new Contract(result));
            }).catch(err => {
                reject(err);
            }) 
        });
    }
}
