/** JSON equality ignores object key order, but preserves values and array order. */
export const serializeSnapshotPayload = (value: unknown): string => JSON.stringify(value, (_key, item) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
  }
  return item;
});

export function snapshotPayloadUnchanged(current: any, next: unknown): boolean {
  if (!current) return false;
  const stored = typeof current.fund_data === 'string' ? JSON.parse(current.fund_data) : current.fund_data;
  return serializeSnapshotPayload(stored) === serializeSnapshotPayload(next);
}

/** Historical descriptive metadata is not the actor identity or an authority source. */
export function snapshotOwnerMetadata(current: any, ownerId: string, actor: any, actorRole: string, ownerRole?: string) {
  if (current) {
    if (!current.user_id) throw new Error('Identità storica dello snapshot mancante.');
    return { user_id: current.user_id, email: current.email ?? null, role: current.role ?? null };
  }
  if (actor.id !== ownerId && !ownerRole) throw new Error('Ruolo del proprietario non verificabile.');
  return { user_id: ownerId, email: actor.id === ownerId ? actor.email ?? null : null, role: actor.id === ownerId ? actorRole : ownerRole };
}
