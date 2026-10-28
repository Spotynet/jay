"use strict";

import { State } from '../../State';
import NodeManager from '../../web/tools/NodeManager';

/**
 * @deprecated `LegacyGestureStateManagerType` is deprecated and will be removed in the future. Please use the new, hook-based API instead.
 */

export const GestureStateManager = {
  create(handlerTag) {
    return {
      handlerTag,
      begin: () => {
        NodeManager.getHandler(handlerTag).begin();
      },
      activate: () => {
        const handler = NodeManager.getHandler(handlerTag);

        // Force going from UNDETERMINED to ACTIVE through BEGAN to preserve
        // the correct state transition flow.
        if (handler.state === State.UNDETERMINED) {
          handler.begin();
        }
        handler.activate(true);
      },
      fail: () => {
        NodeManager.getHandler(handlerTag).fail();
      },
      end: () => {
        NodeManager.getHandler(handlerTag).end();
      }
    };
  }
};
//# sourceMappingURL=gestureStateManager.web.js.map