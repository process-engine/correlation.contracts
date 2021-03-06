import {IIdentity} from '@essential-projects/iam_contracts';

import {Correlation, CorrelationState, ProcessInstance} from './types/index';

/**
 * The Service for accessing the CorrelationRepository.
 *
 * Correlations combine a Correlation ID and ProcessInstance with a ProcessModel Hash.
 * This allows for implementing versioning of ProcessModels, as well as keeping
 * track on how a ProcessModel looked at the time a certain ProcessInstance was run.
 *
 * Note that a ProcssInstance will only belong to one Correlation,
 * but a Correlation can have multiple ProcssInstances.
 */
export interface ICorrelationService {

  /**
   * Stores a new Correlation in the database.
   *
   * @async
   * @param identity                The executing users identity.
   * @param correlationId           The ID of the Correlation to store.
   * @param processInstanceId       The ID of the ProcessInstance to associate
   *                                with the Correlation.
   * @param processModelId          The ID of the ProcessModel to associate
   *                                with the Correlation.
   * @param processModelHash        The Hash of the ProcessModel to associate
   *                                with the Correlation.
   * @param parentProcessInstanceId Optional: If the ProcessInstance is a
   *                                Subprocess, this contains the ID of the
   *                                ProcessInstance that started it.
   */
  createEntry(
    identity: IIdentity,
    correlationId: string,
    processInstanceId: string,
    processModelId: string,
    processModelHash: string,
    parentProcessInstanceId?: string,
  ): Promise<void>;

  /**
   * Returns a list of all Correlations.
   *
   * @async
   * @param identity The executing users identity.
   * @param offset   Optional: The number of records to skip.
   * @param limit    Optional: The max. number of entries to return.
   * @returns        A list of Correlations.
   */
  getAll(identity: IIdentity, offset?: number, limit?: number): Promise<Array<Correlation>>;

  /**
   * Returns a list of all Correlations that contain at least one active
   * ProcessInstance.
   *
   * @async
   * @param identity The executing users identity.
   * @param offset   Optional: The number of records to skip.
   * @param limit    Optional: The max. number of entries to return.
   * @returns        A list of Correlations.
   */
  getActive(identity: IIdentity, offset?: number, limit?: number): Promise<Array<Correlation>>;

  /**
   * Gets a specific Correlation by its ID.
   *
   * @async
   * @param identity        The executing users identity.
   * @param correlationId   The ID of the Correlation to retrieve.
   * @returns               The retrieved Correlation.
   * @throws                404, If the Correlation was not found.
   */
  getByCorrelationId(identity: IIdentity, correlationId: string): Promise<Correlation>;

  /**
   * Gets all entries with a specific ProcessModelId.
   *
   * @async
   * @param identity        The executing users identity.
   * @param processModelId  The ID of the ProcessModel for which to retrieve
   *                        the Correlations.
   * @param offset          Optional: The number of records to skip.
   * @param limit           Optional: The max. number of entries to return.
   * @returns               The retrieved Correlations.
   */
  getByProcessModelId(identity: IIdentity, processModelId: string, offset?: number, limit?: number): Promise<Array<Correlation>>;

  /**
   * Gets a ProcessInstance by its ID.
   *
   * @async
   * @param identity          The executing users identity.
   * @param processInstanceId The ID of the ProcessInstance to get.
   * @returns                 The retrieved ProcessInstance.
   * @throws                  404, If the ProcessInstance was not found.
   */
  getByProcessInstanceId(identity: IIdentity, processInstanceId: string): Promise<ProcessInstance>;

  /**
   * Gets all ProcessInstances that run as a Subprocess for the given ProcessInstanceId.
   *
   * @async
   * @param identity          The executing users identity.
   * @param processInstanceId The ID of the ProcessInstance for which to retrieve
   *                          the SubProcessInstances.
   * @param offset            Optional: The number of records to skip.
   * @param limit             Optional: The max. number of entries to return.
   * @returns                 The retrieved SubProcessInstances.
   *                          If none are found, an empty Array is returned.
   */
  getSubprocessesForProcessInstance(identity: IIdentity, processInstanceId: string, offset?: number, limit?: number): Promise<Array<ProcessInstance>>;

  /**
   * Gets a list of all ProcessInstances that run in the given Correlation.
   *
   * @async
   * @param   identity       The executing users identity.
   * @param   correlationId  The ID of the correlation for which to get the ProcessInstances.
   * @param   offset         Optional: The number of records to skip.
   * @param   limit          Optional: The max. number of entries to return.
   * @returns                A list with matching ProcessInstances; or an empty Array, if non were found.
   */
  getProcessInstancesForCorrelation(identity: IIdentity, correlationId: string, offset?: number, limit?: number): Promise<Array<ProcessInstance>>;

  /**
   * Gets a list of all ProcessInstances for the given ProcessModel.
   *
   * @async
   * @param   identity        The executing users identity.
   * @param   processModelId  The ID of the ProcessModel for which to get the ProcessInstances.
   * @param   offset          Optional: The number of records to skip.
   * @param   limit           Optional: The max. number of entries to return.
   * @returns                 A list with matching ProcessInstances; or an empty Array, if non were found.
   */
  getProcessInstancesForProcessModel(identity: IIdentity, processModelId: string, offset?: number, limit?: number): Promise<Array<ProcessInstance>>;

  /**
   * Gets a list of all ProcessInstances that are in a matching state.
   *
   * @async
   * @param   identity The executing users identity.
   * @param   state    the state by which to query the ProcessInstances.
   * @param   offset   Optional: The number of records to skip.
   * @param   limit    Optional: The max. number of entries to return.
   * @returns          A list with matching ProcessInstances; or an empty Array, if non were found.
   */
  getProcessInstancesByState(identity: IIdentity, state: CorrelationState, offset?: number, limit?: number): Promise<Array<ProcessInstance>>;

  /**
   * Removes all Correlations with a specific ProcessModelId.
   *
   * @async
   * @param identity        The executing users identity.
   * @param processModelId  The ID of the processModel, by which Correlations should be removed.
   */
  deleteCorrelationByProcessModelId(identity: IIdentity, processModelId: string): Promise<void>;

  /**
   * Finishes the given ProcessInstance in the given Correlation.
   *
   * @async
   * @param  identity          The executing users identity.
   * @param  correlationId     The ID of the Correlation to finish.
   * @param  processInstanceId The ID of the ProcessInstance to finish.
   * @throws {NotFoundError}   When no matching correlation was found.
   * @throws {ForbiddenError}  When the user doesn't have access to the
   *                           correlation.
   */
  finishProcessInstanceInCorrelation(identity: IIdentity, correlationId: string, processInstanceId: string): Promise<void>;

  /**
   * Finishes the given ProcessInstance in the given Correlation with an error.
   *
   * @async
   * @param  identity          The executing users identity.
   * @param  correlationId     The ID of the Correlation to finish erroneously.
   * @param  processInstanceId The ID of the ProcessInstance to finish.
   * @param  error             The error that occurred.
   * @throws {NotFoundError}   When no matching correlation was found.
   * @throws {ForbiddenError}  When the user doesn't have access to the
   *                           correlation.
   */
  finishProcessInstanceInCorrelationWithError(identity: IIdentity, correlationId: string, processInstanceId: string, error: Error): Promise<void>;
}
