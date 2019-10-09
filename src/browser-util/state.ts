import clone from 'clone';
import { ReplicantBrowser } from 'nodecg/types/browser'; // eslint-disable-line
import Vue from 'vue';
import Vuex from 'vuex';
import { Bingoboard, BingoboardMeta, BingosyncSocket, DonationTotal, TrackerOpenBids, TrackerDonations, VoiceActivity, TrackerPrizes } from "../../schemas";
import { RunDataActiveRun, RunDataArray, Timer } from "../../speedcontrol-types";

Vue.use(Vuex);

const replicantNames = [
  'bingoboard',
  'bingoboardMeta',
  'bingosyncSocket',
  'donationTotal',
  'trackerDonations',
  'trackerOpenBids',
  'trackerPrizes',
  'voiceActivity'
];
const nodecgSpeedcontrolReplicantNames = [
  'runDataActiveRun',
  'runDataArray',
  'timer'
]
const replicants: Map<string,ReplicantBrowser<any>> = new Map();

var playerAlternateInterval: NodeJS.Timeout | null = null;

export const store = new Vuex.Store({
  state: {
    // bingothon
    bingoboard: [] as Bingoboard,
    bingoboardMeta: {} as BingoboardMeta,
    bingosyncSocket: {} as BingosyncSocket,
    donationTotal: 0 as DonationTotal,
    trackerDonations: [] as TrackerDonations,
    trackerOpenBids: [] as TrackerOpenBids,
    trackerPrizes: [] as TrackerPrizes,
    voiceActivity: {} as VoiceActivity,
    // nodecg-speedcontrol
    runDataActiveRun: {} as RunDataActiveRun,
    runDataArray: [] as RunDataArray,
    timer: {} as Timer,
    // timer
    playerAlternate: true,
  },
  mutations: {
    updateReplicant(state, { name, value }) {
      Vue.set(state, name, value);
    },
    startPlayerAlternateInterval(state, interval) {
      if (playerAlternateInterval) {
        clearInterval(playerAlternateInterval);
      }
      playerAlternateInterval = setInterval(() => {
        Vue.set(state, 'playerAlternate', !state.playerAlternate);
      }, interval);
    },
    stopPlayerAlternateInterval(state) {
      if (playerAlternateInterval) {
        clearInterval(playerAlternateInterval);
      }
      playerAlternateInterval = null;
    }
  },
});

store.commit('startPlayerAlternateInterval', 10000);

/**
 * Gets the raw replicant, only intended for modifications, to use values use state
 * @param replicant name of the replicant, throws an error if it isn't found
 */
export function getReplicant<T>(replicant: string): ReplicantBrowser<T> {
  const rep = replicants.get(replicant);
  if (!rep) {
    throw new Error("invalid replicant!");
  }
  return rep;
}

replicantNames.forEach((name) => {
  const replicant = nodecg.Replicant(name);

  replicant.on('change', (newVal) => {
    store.commit('updateReplicant', {
      name: replicant.name,
      value: clone(newVal),
    });
  });

  replicants.set(name,replicant);
});

nodecgSpeedcontrolReplicantNames.forEach(name => {
  const rep = nodecg.Replicant(name, 'nodecg-speedcontrol');

  rep.on('change', newVal => {
    store.commit('updateReplicant', {
      name: rep.name,
      value: clone(newVal),
    });
  });

  replicants.set(name,rep);
})

export async function create() {
  return NodeCG.waitForReplicants(...Array.from(replicants.values())).then(() => store);
}