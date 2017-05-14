import stages from './routineStages';
import { PROMISE_ACTION } from './constants';

const identity = i => i;

export default function createRoutine(routineName = '', payloadCreator = identity) {
  if (typeof routineName !== 'string') {
    throw new Error('Invalid routine name, it should be a string');
  }

  const routineParams = stages.reduce((result, stage) => {
    const stageActionType = `${routineName}_${stage}`;
    const stageActionCreator = (payload) => ({
      type: stageActionType,
      payload: payloadCreator(payload),
      namespace: routineName.toLowerCase(),
      kind: 'async',
    });
    stageActionCreator.ACTION_TYPE = stageActionType;

    return Object.assign(result, {
      [stage]: stageActionType.toUpperCase(),
      [stage.toLowerCase()]: stageActionCreator,
    });
  }, {});

  const routine = (data, dispatch) => {
    return new Promise((resolve, reject) => dispatch({
      type: PROMISE_ACTION,
      payload: {
        data,
        params: routineParams,
        defer: { resolve, reject },
      },
    }));
  };

  return Object.assign(routine, routineParams);
}
