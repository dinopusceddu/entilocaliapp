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
export function snapshotOwnerMetadata(current: any, ownerId: string, actor: any, actorRole: string) {
  if (current) {
    if (current.user_id !== ownerId) throw new Error('Proprietario dello snapshot incoerente.');
    return { email: current.email ?? null, role: current.role ?? null };
  }
  if (actor.id !== ownerId) throw new Error('Inizializzare lo snapshot con il ruolo del proprietario prima del salvataggio.');
  return { email: actor.email ?? null, role: actorRole };
}
