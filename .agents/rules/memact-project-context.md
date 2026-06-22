## Current Product Loop

Memact is a user-controlled context and identity network.

Apps learn things about users.

Instead of keeping those observations trapped inside individual products, apps can propose context to Memact.

The user decides what becomes part of their identity.

```txt
App
 ↓
Evidence or Context Proposal
 ↓
Context
 ↓
Readable Claim
 ↓
Relevance Ranking
 ↓
Freshness Metadata
 ↓
User Approval (when appropriate)
 ↓
Identity
 ↓
CAP
 ↓
Approved Context for Apps
```

Important:

```txt
Activity is not identity.
```

Apps may observe activity.

Apps may propose context.

Users decide what becomes accepted identity.

---

## Memact V1 Philosophy

Memact should not depend on users managing an inbox.

Memact should not require users to create an account before value exists.

Memact should behave like infrastructure.

The preferred flow is:

```txt
App
 ↓
Small Approval Prompt
 ↓
Decision
 ↓
Done
```

Example:

```txt
Works out regularly?

[Save] [No Thanks]
```

Approval should happen inside the app whenever possible.

The Memact dashboard exists primarily for:

* power users
* privacy-conscious users
* claim management
* visibility management
* account management

Most users may rarely visit Memact directly.

---

## Context Responsibilities

Context is no longer only a category system.

Context is responsible for:

* shaping evidence into readable claims
* assigning categories
* ranking relevance across categories
* attaching timestamps
* tracking freshness

Example:

```txt
Runs 4 times per week
```

May become:

```txt
Works out regularly

Fitness: 1.0
Health: 0.8
Music: 0.3
Nutrition: 0.6
```

Context should help answer:

```txt
What approved context is relevant to this task?
```

not simply:

```txt
Which category does this belong to?
```
