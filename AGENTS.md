# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.


## vexp <!-- vexp v2.0.17 -->

**MANDATORY: use `run_pipeline` — do NOT grep or glob the codebase.**
vexp returns pre-indexed, graph-ranked context in a single call.

### Workflow
1. `run_pipeline` with your task description — ALWAYS FIRST (replaces all other tools)
2. Make targeted changes based on the context returned
3. `run_pipeline` again only if you need more context

### Available MCP tools
- `run_pipeline` — **PRIMARY TOOL**. Runs capsule + impact + memory in 1 call.
  Auto-detects intent. Includes file content. Example: `run_pipeline({ "task": "fix auth bug" })`
- `get_skeleton` — compact file structure
- `index_status` — indexing status
- `expand_vexp_ref` — expand V-REF placeholders in v2 output

### Agentic search
- Do NOT use built-in file search, grep, or codebase indexing — always call `run_pipeline` first
- If you spawn sub-agents or background tasks, pass them the context from `run_pipeline`
  rather than letting them search the codebase independently

### Smart Features
Intent auto-detection, hybrid ranking, session memory, auto-expanding budget.

### Multi-Repo
`run_pipeline` auto-queries all indexed repos. Use `repos: ["alias"]` to scope. Run `index_status` to see aliases.
<!-- /vexp -->

## Security: Encrypted Auth Token Storage

`expo-secure-store` is **not yet installed**. Auth tokens are currently stored
in unencrypted AsyncStorage (`src/lib/supabase.ts`). To fix this:

1. Install the package:
   ```bash
   npx expo install expo-secure-store
   ```

2. Replace the `storage: AsyncStorage` option in `src/lib/supabase.ts` with a
   chunking adapter (expo-secure-store has a 2048-byte key size limit):

   ```ts
   import * as SecureStore from "expo-secure-store";

   const SecureStoreAdapter = {
     getItem: async (key: string) => {
       const countStr = await SecureStore.getItemAsync(`${key}_count`);
       if (!countStr) return SecureStore.getItemAsync(key);
       const count = parseInt(countStr, 10);
       let result = "";
       for (let i = 0; i < count; i++) {
         result += (await SecureStore.getItemAsync(`${key}_chunk_${i}`)) ?? "";
       }
       return result || null;
     },
     setItem: async (key: string, value: string) => {
       const chunkSize = 2000;
       if (value.length <= chunkSize) {
         await SecureStore.setItemAsync(`${key}_count`, "");
         return SecureStore.setItemAsync(key, value);
       }
       const chunks = Math.ceil(value.length / chunkSize);
       await SecureStore.setItemAsync(`${key}_count`, String(chunks));
       for (let i = 0; i < chunks; i++) {
         await SecureStore.setItemAsync(
           `${key}_chunk_${i}`,
           value.slice(i * chunkSize, (i + 1) * chunkSize)
         );
       }
     },
     removeItem: async (key: string) => {
       const countStr = await SecureStore.getItemAsync(`${key}_count`);
       if (countStr) {
         const count = parseInt(countStr, 10);
         for (let i = 0; i < count; i++) {
           await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
         }
         await SecureStore.deleteItemAsync(`${key}_count`);
       } else {
         await SecureStore.deleteItemAsync(key);
       }
     },
   };
   ```

3. Change the `createClient` call to use `storage: SecureStoreAdapter`.

4. Remove the `AsyncStorage` import (and `@react-native-async-storage/async-storage`
   dependency if it is no longer needed elsewhere).