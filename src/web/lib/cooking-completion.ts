import { useCookingStore } from '../stores/useCookingStore';
import { ApiError } from '../services/http';
import { recipesApi } from '../services/recipes';
import { capturePrivateSession } from './private-session';
import { invalidateWeekDependents } from './query-invalidation';
import { cookingFailure } from './cooking-review';

/** A command may finish after its screen closes; only its own run can receive it. */
export async function submitCookingCompletion(): Promise<void> {
  const state = useCookingStore.getState();
  const { runId, activeRecipe } = state;
  const isCurrent = capturePrivateSession();
  const attempt = state.beginCompletion();
  if (!attempt || !activeRecipe || !runId) return;
  const stillOwns = () => isCurrent() && useCookingStore.getState().runId === runId;
  try {
    const result = await recipesApi.completeCooking(
      activeRecipe.id,
      attempt.deductions,
      attempt.commandId,
      state.stockSnapshot,
    );
    if (!stillOwns()) return;
    state.finishCompletion(runId, attempt.commandId, result.pendingSync ? 'queued' : 'saved');
    void invalidateWeekDependents();
  } catch (error) {
    if (!stillOwns()) return;
    const failure = cookingFailure(error);
    const restricted = error instanceof ApiError && error.code === 'HARD_CONSTRAINT_CONFLICT';
    const blocked =
      error instanceof ApiError && (error.kind === 'auth' || error.code === 'IDEMPOTENCY_CONFLICT');
    state.finishCompletion(
      runId,
      attempt.commandId,
      failure.recoverable
        ? 'rejected'
        : restricted
          ? 'restricted'
          : blocked
            ? 'blocked'
            : 'uncertain',
      failure.message,
    );
  }
}
