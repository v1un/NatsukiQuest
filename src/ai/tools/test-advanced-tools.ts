// src/ai/tools/test-advanced-tools.ts
/**
 * @fileOverview Test script for the advanced game tools to ensure they work correctly
 * 
 * This file provides testing utilities and example usage for all the new AI tools.
 * Run this to verify that the tools integrate properly with the database and game state.
 */

import { 
  updateReputation,
  createQuest, 
  updateQuestProgress,
  createRelationshipConflict,
  resolveRelationshipConflict,
  addEnvironmentalDetail,
  discoverEnvironmentalDetail,
  addLoreEntry
} from './advanced-game-tools';
import { generateProceduralQuest as questGenerator } from './quest-generator';

// Test data
const TEST_USER_ID = 'test_user_123';

/**
 * Test reputation management
 */
export async function testReputationSystem() {
  console.log('🧪 Testing Reputation System...');
  
  try {
    // Test adding reputation
    const result1 = await updateReputation({
      userId: TEST_USER_ID,
      faction: 'Royal Knights',
      change: 25,
      reason: 'Helped defend the village from bandits',
      location: 'Arlam Village'
    });
    
    console.log('✅ Reputation Update:', result1);
    
    // Test negative reputation change
    const result2 = await updateReputation({
      userId: TEST_USER_ID,
      faction: 'Witch Cult',
      change: -30,
      reason: 'Opposed their dark rituals',
      location: 'Forbidden Forest'
    });
    
    console.log('✅ Negative Reputation:', result2);
    
    return { success: true, message: 'Reputation system tests passed' };
  } catch (error) {
    console.error('❌ Reputation test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Test quest system
 */
export async function testQuestSystem() {
  console.log('🧪 Testing Quest System...');
  
  try {
    // Test quest creation
    const questResult = await createQuest({
      userId: TEST_USER_ID,
      title: 'The Missing Merchant',
      description: 'A traveling merchant has gone missing on the road to the capital. Find out what happened to him.',
      category: 'SIDE',
      objectives: [
        { description: 'Investigate the merchant\'s last known location' },
        { description: 'Search for clues along the trade route', maxProgress: 3 },
        { description: 'Report findings to the Merchant Guild' }
      ],
      rewards: [
        { type: 'REPUTATION', faction: 'Merchant Guild', amount: 15 },
        { type: 'ITEM', itemId: 'gold_coins', amount: 100 }
      ],
      location: 'Trade Route',
      npcsInvolved: ['Guild Master Horik', 'Guard Captain Thane']
    });
    
    console.log('✅ Quest Creation:', questResult);
    
    if (questResult.success && questResult.questId) {
      // Test quest progress update
      const progressResult = await updateQuestProgress({
        userId: TEST_USER_ID,
        questId: questResult.questId,
        objectiveId: `${questResult.questId}_obj_0`,
        completeObjective: true
      });
      
      console.log('✅ Quest Progress:', progressResult);
    }
    
    return { success: true, message: 'Quest system tests passed' };
  } catch (error) {
    console.error('❌ Quest test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Test procedural quest generator
 */
export async function testProceduralQuests() {
  console.log('🧪 Testing Procedural Quest Generator...');
  
  try {
    const questResult = await questGenerator({
      userId: TEST_USER_ID,
      questType: 'ROMANCE',
      targetCharacter: 'Emilia',
      difficultyLevel: 'MEDIUM'
    });
    
    console.log('✅ Procedural Quest:', questResult);
    
    return { success: true, message: 'Procedural quest tests passed' };
  } catch (error) {
    console.error('❌ Procedural quest test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Test relationship conflict system
 */
export async function testRelationshipConflicts() {
  console.log('🧪 Testing Relationship Conflict System...');
  
  try {
    // Create a conflict
    const conflictResult = await createRelationshipConflict({
      userId: TEST_USER_ID,
      charactersInvolved: ['Emilia', 'Rem'],
      type: 'JEALOUSY',
      severity: 6,
      description: 'Rem shows signs of jealousy over Subaru\'s attention to Emilia',
      triggers: ['spending_time_with_emilia', 'ignoring_rem', 'romantic_gestures'],
      consequences: [
        {
          character: 'Rem',
          affinityChange: -10,
          dialogue: 'Rem seems distant and hurt...',
          questImpact: 'May refuse to help with certain tasks'
        },
        {
          character: 'Emilia',
          affinityChange: 5,
          dialogue: 'Emilia notices the tension but isn\'t sure how to help'
        }
      ]
    });
    
    console.log('✅ Conflict Creation:', conflictResult);
    
    if (conflictResult.success && conflictResult.conflictId) {
      // Test conflict resolution
      const resolutionResult = await resolveRelationshipConflict({
        userId: TEST_USER_ID,
        conflictId: conflictResult.conflictId,
        resolution: 'RESOLVE',
        playerAction: 'Had an honest conversation with both characters about the situation'
      });
      
      console.log('✅ Conflict Resolution:', resolutionResult);
    }
    
    return { success: true, message: 'Relationship conflict tests passed' };
  } catch (error) {
    console.error('❌ Relationship conflict test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Test environmental storytelling
 */
export async function testEnvironmentalStorytelling() {
  console.log('🧪 Testing Environmental Storytelling...');
  
  try {
    // Add environmental detail
    const detailResult = await addEnvironmentalDetail({
      userId: TEST_USER_ID,
      location: 'Roswaal Manor Library',
      description: 'An old tome lies open on a reading desk, its pages yellowed with age. Strange symbols are visible on the open pages.',
      interactionType: 'LORE',
      loreId: 'ancient_magic_theory'
    });
    
    console.log('✅ Environmental Detail:', detailResult);
    
    if (detailResult.success && detailResult.detailId) {
      // Test discovery
      const discoveryResult = await discoverEnvironmentalDetail({
        userId: TEST_USER_ID,
        detailId: detailResult.detailId
      });
      
      console.log('✅ Environmental Discovery:', discoveryResult);
    }
    
    return { success: true, message: 'Environmental storytelling tests passed' };
  } catch (error) {
    console.error('❌ Environmental storytelling test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Test lore system
 */
export async function testLoreSystem() {
  console.log('🧪 Testing Lore System...');
  
  try {
    const loreResult = await addLoreEntry({
      userId: TEST_USER_ID,
      title: 'The Witch of Envy',
      content: 'Long ago, a powerful witch consumed half the world in her jealousy. Her name was Satella, and she was both feared and pitied by those who knew her story.',
      category: 'History',
      tags: ['witch', 'satella', 'envy', 'ancient_history'],
      characters: ['Satella'],
      location: 'Ancient Library',
      autoDiscover: true
    });
    
    console.log('✅ Lore Entry:', loreResult);
    
    return { success: true, message: 'Lore system tests passed' };
  } catch (error) {
    console.error('❌ Lore test failed:', error);
    return { success: false, message: error };
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Advanced Game Tools Test Suite...\n');
  
  const results = await Promise.allSettled([
    testReputationSystem(),
    testQuestSystem(),
    testProceduralQuests(),
    testRelationshipConflicts(),
    testEnvironmentalStorytelling(),
    testLoreSystem()
  ]);
  
  console.log('\n📊 Test Results Summary:');
  results.forEach((result, index) => {
    const testNames = [
      'Reputation System',
      'Quest System', 
      'Procedural Quests',
      'Relationship Conflicts',
      'Environmental Storytelling',
      'Lore System'
    ];
    
    if (result.status === 'fulfilled' && result.value.success) {
      console.log(`✅ ${testNames[index]}: PASSED`);
    } else {
      console.log(`❌ ${testNames[index]}: FAILED`);
      if (result.status === 'rejected') {
        console.log(`   Error: ${result.reason}`);
      }
    }
  });
  
  const passedTests = results.filter(r => 
    r.status === 'fulfilled' && r.value.success
  ).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${results.length} tests passed`);
  
  return {
    totalTests: results.length,
    passedTests,
    success: passedTests === results.length
  };
}

// Usage example:
// To test individual systems:
// await testReputationSystem();
// await testQuestSystem();
// 
// To run all tests:
// await runAllTests();