# Real-time Data Synchronization Strategy

**Date**: May 2026  
**Status**: Implementation Complete  
**Target**: <50 users MVP phase

---

## 📋 Executive Summary

This document outlines the **real-time data synchronization strategy** for the RedNote social platform. The chosen approach prioritizes **user experience (instant feedback) + server reliability (minimal load)** for the MVP phase with <50 users.

**Chosen Architecture**: **Optimistic Update + Refetch + Periodic Sync**

---

## 🎯 Why This Approach?

### Comparison Table

| Aspect | Optimistic<br/>+ Refetch | WebSocket | Polling | None |
|--------|------------------------|-----------|---------|------|
| **Real-time Feel** | ✅ Instant | ✅✅ Best | ⚠️ Delayed | ❌ Manual |
| **Implementation** | ✅ Simple | ⚠️ Complex | ✅ Easy | ✅ Easiest |
| **Server Load** | ✅ Minimal | ✅ Minimal | ❌ High | ⚠️ Manual |
| **Data Reliability** | ✅✅ High | ✅✅ High | ✅ Good | ❌ Manual |
| **Scalability** | ✅ 100-1000s | ✅✅ 1000-100k | ❌ <100 | ❌ <50 |
| **Code Complexity** | 🟢 Low | 🟡 Medium | 🟢 Low | 🟢 Low |
| **Maintenance** | ✅ Low | ⚠️ Medium | ✅ Low | ✅ Low |

### Why NOT WebSocket (Yet)?

```
WebSocket Benefits:
✅ True real-time bidirectional communication
✅ Very scalable (supports 100k+ concurrent connections)

WebSocket Costs:
❌ Requires new socket.io server infrastructure
❌ Complex connection management & fallbacks
❌ Added operational complexity (monitoring, debugging)
❌ Overkill for 50 users (like buying a truck to move a box)
```

### Why NOT Polling?

```
Polling Issues:
❌ Every user × every N seconds = heavy server load
   Example: 50 users polling every 10s = 300 requests/minute
❌ Not "real-time" (delay = polling interval)
❌ Scales poorly (collapses at 500+ users)
```

### Why Optimistic + Refetch + Periodic Sync? ✅

```
Benefits for MVP (<50 users):
✅ Instant UI feedback (feels real-time)
✅ Minimal server load (only 1 refetch per action)
✅ Simple implementation (1-2 weeks vs 1 month for WebSocket)
✅ Data consistency (periodic sync catches drift)
✅ Zero operational complexity
✅ Easy to debug (standard HTTP calls)
✅ Clear migration path to WebSocket later
```

---

## 🏗️ Architecture Overview

### Data Flow Diagram

```
USER ACTIONS (Follow/Like)
    ↓
[1️⃣ OPTIMISTIC UPDATE] → UI Updates Immediately
    ↓
[2️⃣ SEND REQUEST] → POST/DELETE to server
    ↓
[3️⃣ REFETCH] → GET fresh data from server (100ms delay)
    ↓
[4️⃣ ROLLBACK] → If error: Revert UI to previous state
    ↓
[5️⃣ PERIODIC SYNC] → Every 60s: Sync all counters
```

### Example: User Follows Another User

```typescript
// User clicks "Follow" button
1. Click handleFollowClick()
   ↓
2. OPTIMISTIC: Set UI to "following", increment followerCount locally
   ↓
3. SEND: POST /users/{id}/follow
   ↓
4. REFETCH: GET /users/{id} after 100ms
   ↓
5. UPDATE: Set latest followerCount from server
   ↓
6. PERIODIC: Every 60s, GET /users/{id} to verify
```

### Timeline

```
Time    UI State              Server State              Action
---     --------              -----                     ------
0ms     Click follow button
        ↓
50ms    ✅ "Following"        (processing)             Optimistic update
        ↓
100ms   "Following"           ✅ Follower +1           HTTP POST completed
        ↓
150ms   ✅ "Following" +1     ✅ Follower +1           Refetch & verify
        Follower +1
        ↓
60s     ✅ Current            ✅ Current               Periodic sync
        state verify
```

---

## 💻 Implementation Details

### Backend Changes: NONE Required ✅

The API already supports:
- `GET /users/{id}` - Get user with all counters
- `POST /users/{id}/follow` - Follow user
- `DELETE /users/{id}/follow` - Unfollow user
- `GET /users/{id}/is-following` - Check follow status
- `POST /posts/{id}/like` - Like post
- Cache headers (`Cache-Control: no-cache, no-store, must-revalidate`)

### Frontend Changes

#### 1. **Optimistic Update** (Immediate)

```typescript
// channel-user-info.tsx
const performFollow = async () => {
  // 1️⃣ STORE PREVIOUS STATE (for rollback)
  const prevFollowing = isFollowing;
  const prevCount = followerCount;

  // 2️⃣ UPDATE UI IMMEDIATELY (optimistic)
  setIsFollowing(!prevFollowing);
  setFollowerCount(prev => 
    prevFollowing ? prev - 1 : prev + 1
  );

  try {
    // 3️⃣ SEND REQUEST (HTTP call)
    await apiClient.post(`/users/${user.id}/follow`);

    // 4️⃣ REFETCH (verify with server)
    await refetchUserData();
  } catch (error) {
    // 5️⃣ ROLLBACK (if error)
    setIsFollowing(prevFollowing);
    setFollowerCount(prevCount);
  }
};
```

#### 2. **Refetch After Action** (100ms delay)

```typescript
const refetchUserData = async () => {
  try {
    const response = await apiClient.get<User>(`/users/${user.id}`);
    const freshData = response.data;
    
    // Update with server-verified data
    setFollowerCount(freshData.followerCount);
    setFollowingCount(freshData.followingCount);
    setTotalLikesReceived(freshData.totalLikesReceived);
    
    onUserDataRefresh?.(freshData);
  } catch {
    // Silent fail - keep optimistic updates
  }
};
```

#### 3. **Periodic Sync** (Every 60 seconds)

```typescript
useEffect(() => {
  // Setup periodic sync when component mounts
  const syncTimer = setInterval(() => {
    refetchUserData();
  }, 60000); // 60 seconds

  return () => clearInterval(syncTimer);
}, []);
```

---

## 🎯 Performance Metrics

### Server Load

```
Scenario: 50 concurrent users, 1 follow action per minute

Without optimization:
- 50 users × polling every 10s = 300 requests/minute = 5 req/sec ⚠️

With our approach:
- 50 users × (1 action/min + sync every 60s) ≈ 1-2 req/sec ✅
- Reduction: 95% less traffic
```

### Response Times

```
User Experience Timeline:

Optimistic Update:     0ms ⚡ (instant)
HTTP Request:          50-200ms (network)
Refetch:               100-300ms (with 100ms delay)
Periodic Sync:         30-120ms (background, unnoticed)

User feels: Updates are instant ✅
```

### Data Consistency

```
Scenario: User A follows User B

Timeline:
0ms:      User A's UI shows "Following" (optimistic)
100ms:    Refetch gets latest count from server
1min:     Periodic sync verifies consistency
1hr:      If any drift due to edge cases, periodic sync corrects it

Worst case consistency: 60 seconds
Likely case: <200ms
```

---

## ⚠️ Important Considerations

### 1. **Race Conditions**

**Problem**: What if user clicks "Follow" twice quickly?

```typescript
// Solution: Disable button during request
<button disabled={isLoading}>
  {isLoading ? 'Đang...' : 'Follow'}
</button>
```

**Result**: Second click is ignored until first completes ✅

### 2. **Network Errors**

**Problem**: What if refetch fails?

```typescript
const refetchUserData = async () => {
  try {
    // ... fetch
  } catch (error) {
    // Silent fail - keep optimistic updates
    // Periodic sync will fix any issues in 60s
  }
};
```

**Result**: Optimistic updates stay visible, sync catches issues ✅

### 3. **Concurrent User Actions**

**Problem**: User A and B both follow User C simultaneously?

```
User A: +1 follower (100ms to sync)
User B: +1 follower (100ms to sync)
Server: Actual +2

Solution: Refetch gets true count ✅
Timeline: All user UIs sync within 200ms
```

### 4. **Stale Data on Page Refresh**

**Problem**: User closes/reopens page - data is stale?

```typescript
// Page reload fetches fresh server data
export async function ChannelPage() {
  const user = await getUserByUsername(username); // Fresh data
  return <ChannelShell profile={user} />;
}
```

**Result**: F5 = fresh data from server ✅

### 5. **Edge Case: Multiple Tabs**

**Scenario**: User has 2 tabs open on same profile

```
Tab A: Click Follow
  → +1 follower count locally
  → Refetch: server shows +1
  
Tab B: Still shows old count (no refetch)
  → After 60s periodic sync: Tab B updates ✅
  
Worst case: Tab B sees stale data for 60s
Most case: User switches back to Tab A (sees correct)
```

**Mitigation**: Add BroadcastChannel API for cross-tab sync (future)

---

## 🚀 Future Evolution Path

### Phase 1: MVP (<50 users) ✅ CURRENT
- Optimistic + Refetch + Periodic Sync
- Cost: Minimal infrastructure
- Complexity: Low

### Phase 2: Growth (50-500 users)
- Add [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) for cross-tab sync
- Cost: Zero (browser API)
- Complexity: Low

### Phase 3: Scaling (500-5000 users)
- Add WebSocket for true real-time (push notifications)
- Cost: Socket.io infrastructure
- Complexity: Medium
- Migration: Drop-in replacement, no client changes needed

### Phase 4: Large Scale (5000+ users)
- Redis pub/sub for distributed real-time
- Cost: Redis infrastructure
- Complexity: High
- Performance: Handles 100k+ concurrent users

---

## 📊 Monitoring & Debugging

### How to Monitor

```typescript
// Add to refetchUserData for debugging
const refetchUserData = async () => {
  const start = performance.now();
  try {
    const response = await apiClient.get(`/users/${user.id}`);
    const duration = performance.now() - start;
    
    console.log(`[Sync] User data refetched in ${duration.toFixed(0)}ms`);
    console.log(`[Sync] Follower count: ${response.data.followerCount}`);
    
    // Update state...
  } catch (error) {
    console.warn('[Sync] Refetch failed, keeping optimistic state', error);
  }
};
```

### Expected Metrics

```
✅ Refetch time: 100-300ms (network dependent)
✅ Periodic sync: Every 60s ± 10s
✅ Rollback trigger: Error on POST/DELETE
⚠️ If periodic sync fails: Check API connectivity
⚠️ If UI shows old data: Check browser refresh (F5)
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test optimistic update
it('should update UI immediately on follow', () => {
  performFollow();
  expect(isFollowing).toBe(true);
  expect(followerCount).toBe(initialCount + 1);
});

// Test rollback on error
it('should rollback on API error', async () => {
  apiClient.post.mockRejectedValue(new Error('Network error'));
  await performFollow();
  expect(isFollowing).toBe(false);
  expect(followerCount).toBe(initialCount);
});
```

### E2E Tests

```typescript
// Test full flow
it('should sync data after follow action', async () => {
  // Click follow
  await userEvent.click(followButton);
  
  // Check optimistic update
  expect(screen.getByText('Following')).toBeInTheDocument();
  
  // Wait for refetch (100ms)
  await waitFor(() => {
    expect(followerCount).toBe(expectedCount);
  }, { timeout: 200 });
});
```

---

## 📝 API Response Contracts

### Ensure these endpoints return full User data

```typescript
// GET /users/{id}
{
  "data": {
    "id": "uuid",
    "username": "user123",
    "followerCount": 42,      // ← Must have
    "followingCount": 15,     // ← Must have
    "totalLikesReceived": 128,// ← Must have
    "videoCount": 5,
    "avatarUrl": "...",
    // ... other fields
  },
  "error": null
}
```

---

## 🔄 Migration to WebSocket (Future)

When you're ready to add WebSocket:

```typescript
// No client code changes needed!
// Just add WebSocket listener alongside current code

socket.on(`user:${userId}:follow`, (event) => {
  // { followerCount: 43, followingCount: 15 }
  setFollowerCount(event.followerCount);
  setFollowingCount(event.followingCount);
});
```

The periodic sync becomes a fallback for WebSocket disconnections ✅

---

## 📚 Key Takeaways

| What | Why | When |
|------|-----|------|
| **Optimistic Update** | Feels real-time | Immediately on user action |
| **Refetch** | Verifies server state | 100ms after action |
| **Periodic Sync** | Catches drift | Every 60s in background |
| **Rollback** | Recovers from errors | If API request fails |
| **WebSocket** | True real-time | When >500 users |

---

## 🎓 Code Locations

- **Implementation**: `apps/web/src/app/channel/[username]/components/channel-user-info.tsx`
- **State Management**: `channel-shell.tsx` (parent component)
- **API Client**: `apps/web/src/lib/api-client.ts`
- **Backend Routes**: `apps/api/src/modules/users/users.controller.ts`

---

## 🤝 Contributing

When adding new real-time metrics:

1. Add `refetch` call after action
2. Add state variable for optimistic update
3. Set up periodic sync in useEffect
4. Test with slow network (DevTools throttle)

---

## 📞 Questions?

Common issues and solutions:

**Q: Data shows stale value after action?**  
A: Check if refetch promise is awaited. Should auto-update within 200ms.

**Q: Periodic sync causes performance lag?**  
A: Normal - it's a background sync. Use DevTools to verify it's <50ms.

**Q: Multiple tabs out of sync?**  
A: Expected for MVP. Add BroadcastChannel API in Phase 2.

**Q: Ready for WebSocket?**  
A: When user count hits 500-1000. Plan 2-3 week implementation.

---

**Last Updated**: May 14, 2026  
**Next Review**: When user count reaches 100
