# Rsync

A TypeScript-first `rsync` wrapper for Node.js with a Promise-based API.

## Installation

```bash
npm install @moritzloewenstein/rsync
```

## Features

- ✅ **TypeScript native** - Full type definitions included
- ✅ **Promise-based API** - Modern async/await support
- ✅ **Simple configuration** - Options object-based API
- ✅ **Type-safe** - Comprehensive TypeScript interfaces
- ✅ **ESM** - Pure ES modules

## Quick Start

```typescript
import Rsync from "rsync";

const rsync = new Rsync({
  source: "/path/to/source",
  destination: "server:/path/to/destination",
  flags: "avz",
  shell: "ssh",
});

try {
  const result = await rsync.execute();
  console.log("Transfer complete:", result.cmd);
} catch (error) {
  console.error("Transfer failed:", error);
}
```

## API

### Constructor

Create a new Rsync instance with an options object:

```typescript
const rsync = new Rsync(options);
```

### Options

```typescript
interface RsyncOptions {
  // Source and destination
  source?: string | string[];
  destination?: string;

  // Executable configuration
  executable?: string; // default: 'rsync'
  executableShell?: string; // default: '/bin/sh'

  // Process configuration
  cwd?: string;
  env?: NodeJS.ProcessEnv;

  // Flags (string or array of single letter flags)
  flags?: string | string[]; // e.g., 'avz' or ['a', 'v', 'z']

  // Common options
  shell?: string; // SSH shell
  delete?: boolean; // --delete
  progress?: boolean; // --progress
  chmod?: string | string[]; // --chmod

  // Transfer options
  archive?: boolean; // -a
  compress?: boolean; // -z
  recursive?: boolean; // -r
  update?: boolean; // -u
  quiet?: boolean; // -q
  dirs?: boolean; // -d
  links?: boolean; // -l
  dry?: boolean; // -n (dry run)

  // Preservation options
  hardLinks?: boolean; // -H
  perms?: boolean; // -p
  executability?: boolean; // -E
  owner?: boolean; // -o
  group?: boolean; // -g
  acls?: boolean; // -A
  xattrs?: boolean; // -X
  devices?: boolean; // --devices
  specials?: boolean; // --specials
  times?: boolean; // -t

  // Include/Exclude patterns
  exclude?: string | string[];
  include?: string | string[];

  // Output handlers
  output?: [(data: Buffer) => void, (data: Buffer) => void];

  // Custom options
  set?: Record<string, string | null>;
}
```

### Methods

#### `execute(stdoutHandler?, stderrHandler?): Promise<RsyncResult>`

Execute the rsync command. Returns a Promise that resolves with the result or rejects with an error.

```typescript
// Simple execution
const result = await rsync.execute();

// With output handlers
const result = await rsync.execute(
  (data) => console.log("stdout:", data.toString()),
  (data) => console.error("stderr:", data.toString())
);
```

**Returns:**

```typescript
interface RsyncResult {
  code: number; // Exit code (0 for success)
  cmd: string; // The executed command
}
```

**Errors:**

```typescript
interface RsyncError extends Error {
  code: number; // rsync exit code
  cmd: string; // The executed command
}
```

#### `command(): string`

Get the complete command string that will be executed.

```typescript
const cmdString = rsync.command();
console.log(cmdString); // "rsync -avz --rsh=ssh /source server:/dest"
```

#### `args(): string[]`

Get the arguments array for the command.

```typescript
const args = rsync.args();
console.log(args); // ['-avz', '--rsh=ssh', '/source', 'server:/dest']
```

#### `executable(): string`

Get the rsync executable path.

```typescript
const exe = rsync.executable(); // 'rsync'
```

#### `source(): string[]`

Get the list of source paths.

```typescript
const sources = rsync.source(); // ['/path/to/source']
```

#### `destination(): string`

Get the destination path.

```typescript
const dest = rsync.destination(); // 'server:/path/to/dest'
```

## Examples

### Basic sync

```typescript
const rsync = new Rsync({
  source: "/local/path",
  destination: "remote:/remote/path",
  flags: "avz",
});

await rsync.execute();
```

### With excludes

```typescript
const rsync = new Rsync({
  source: "/project",
  destination: "server:/backup",
  flags: "avz",
  exclude: ["node_modules", ".git", "*.log"],
  delete: true,
});

await rsync.execute();
```

### With includes and excludes

```typescript
const rsync = new Rsync({
  source: "/data",
  destination: "/backup",
  flags: "avz",
  exclude: ["*"],
  include: ["*.txt", "*.md"],
});

await rsync.execute();
```

### Progress monitoring

```typescript
const rsync = new Rsync({
  source: "/large/dataset",
  destination: "server:/backup",
  flags: "avz",
  progress: true,
});

await rsync.execute(
  (data) => {
    // Parse progress from stdout
    console.log(data.toString());
  },
  (data) => {
    // Handle errors from stderr
    console.error(data.toString());
  }
);
```

### Multiple sources

```typescript
const rsync = new Rsync({
  source: ["/path/one", "/path/two", "/path/three"],
  destination: "/backup",
  flags: "avz",
});

await rsync.execute();
```

### SSH with custom shell

```typescript
const rsync = new Rsync({
  source: "/local",
  destination: "user@server:/remote",
  flags: "avz",
  shell: "ssh -i /path/to/key",
});

await rsync.execute();
```

### Custom options

```typescript
const rsync = new Rsync({
  source: "/source",
  destination: "/dest",
  flags: "avz",
  set: {
    "max-size": "100m",
    "min-size": "1k",
    timeout: "300",
  },
});

await rsync.execute();
```

### Environment and working directory

```typescript
const rsync = new Rsync({
  source: "./relative/path",
  destination: "/absolute/dest",
  cwd: "/project/root",
  env: {
    ...process.env,
    RSYNC_PASSWORD: "secret",
  },
  flags: "avz",
});

await rsync.execute();
```

## TypeScript Usage

This library is written in TypeScript and provides full type definitions:

```typescript
import Rsync, { RsyncOptions, RsyncResult, RsyncError } from "rsync";

const options: RsyncOptions = {
  source: "/src",
  destination: "/dst",
  flags: "avz",
};

const rsync = new Rsync(options);

try {
  const result: RsyncResult = await rsync.execute();
  console.log(`Success! Exit code: ${result.code}`);
} catch (error) {
  const rsyncError = error as RsyncError;
  console.error(`Failed with code ${rsyncError.code}: ${rsyncError.message}`);
}
```

## Common Rsync Flags

- `a` - Archive mode (equals `-rlptgoD`)
- `v` - Verbose
- `z` - Compress during transfer
- `r` - Recursive
- `l` - Copy symlinks as symlinks
- `p` - Preserve permissions
- `t` - Preserve modification times
- `g` - Preserve group
- `o` - Preserve owner
- `H` - Preserve hard links
- `n` - Dry run (no changes made)
- `u` - Skip files that are newer on receiver
- `q` - Quiet mode

Combine multiple flags as a string: `flags: 'avz'`

## Migration from v0.x

The API has changed significantly in v1.0:

### Old (v0.x) - Callback & Chaining

```javascript
var Rsync = require("rsync");

var rsync = new Rsync()
  .shell("ssh")
  .flags("az")
  .source("/path/to/source")
  .destination("server:/path/to/destination");

rsync.execute(function (error, code, cmd) {
  // callback
});
```

### New (v1.0+) - Promise & Options

```typescript
import Rsync from "rsync";

const rsync = new Rsync({
  shell: "ssh",
  flags: "az",
  source: "/path/to/source",
  destination: "server:/path/to/destination",
});

await rsync.execute();
```

### Key Changes

1. **ESM instead of CommonJS** - Use `import` instead of `require`
2. **TypeScript native** - Full type definitions included
3. **Promise-based** - `execute()` returns a Promise instead of using callbacks
4. **Options object** - Pass all configuration to constructor, no method chaining
5. **No `build()` method** - Just use `new Rsync(options)`
6. **Simplified patterns** - Use `exclude` and `include` arrays, no `patterns()` method

## License

This module is licensed under the MIT License. See the `LICENSE` file for more details.

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run tests and type checking
5. Submit a pull request

## Changelog

### v1.0.0

- Complete TypeScript rewrite
- Promise-based API (breaking change)
- Constructor options-only (breaking change)
- Removed method chaining (breaking change)
- Removed `patterns()` method, use `include`/`exclude` arrays
- ESM modules only
- Migrated to Vitest

### v0.6.1

- Add support for windows file paths under cygwin

### v0.6.0

- Escape dollar signs in filenames
- Add permission shorthands
- Added env() option to set the process environment variables

### v0.5.0

- Properly treat flags as String
- Differentiate between shell and file arguments (escaping)
- Added unit tests and TravisCI
