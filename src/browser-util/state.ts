import clone from 'clone';
import Vue, { set } from 'vue';
import { firebaseAction, vuexfireMutations } from 'vuexfire';
import Vuex, { Store } from 'vuex';
import { db } from './firebase';
import {
    AllCamNames,
    AllGameLayouts,
    AllInterviews,
    Asset,
    BestOfX,
    Bingoboard,
    BingoboardMeta,
    BingoboardMode,
    BingosyncSocket,
    CapturePositions,
    CurrentCamNames,
    CurrentGameLayout,
    CurrentInterview,
    CurrentMainBingoboard,
    DiscordDelayInfo,
    DonationTotal,
    ExplorationBingoboard,
    ExternalBingoboard,
    ExternalBingoboardMeta,
    HostBingoCell,
    HostingBingosocket,
    HostsSpeakingDuringIntermission,
    IntermissionVideos,
    LastIntermissionTimestamp,
    ObsAudioLevels,
    ObsAudioSources,
    ObsConnection,
    ObsDashboardAudioSources,
    ObsPreviewImg,
    ObsSceneList,
    ObsStreamMode,
    OmnibarMessages,
    PlayBingoSocket,
    ShowThingsDuringIntermission,
    SongData,
    SoundOnTwitchStream,
    TrackerData,
    TrackerDonations,
    TrackerOpenBids,
    TrackerPrizes,
    TwitchChatBotData,
    TwitchStream,
    VoiceActivity
} from '../../schemas';
import { RunDataActiveRun, RunDataArray, Timer, TwitchCommercialTimer } from '../../speedcontrol-types';
// import { Scene } from "../extension/util/obs" TODO: set types for sccenes
import { Games } from '../../types';
import type NodeCGTypes from '@nodecg/types';

Vue.use(Vuex);

const replicantNames = [
    'allGameLayouts',
    'allInterviews',
    'allCamNames',
    'bestOfX',
    'bingoboard',
    'bingoboardMeta',
    'bingoboardMode',
    'bingosyncSocket',
    'capturePositions',
    'currentGameLayout',
    'currentInterview',
    'currentCamNames',
    'currentMainBingoboard',
    'donationTotal',
    'discordDelayInfo',
    'explorationBingoboard',
    'externalBingoboardMeta',
    'hostingBingoboard',
    'hostingBingosocket',
    'hostsSpeakingDuringIntermission',
    'intermissionVideos',
    'lastIntermissionTimestamp',
    'obsAudioLevels',
    'obsAudioSources',
    'obsConnection',
    'obsDashboardAudioSources',
    'obsPreviewImg',
    'obsPreviewScene',
    'obsCurrentScene',
    'obsSceneList',
    'obsStreamMode',
    'externalBingoboard',
    'omnibarMessages',
    'playBingoSocket',
    'showThingsDuringIntermission',
    'soundOnTwitchStream',
    'trackerData',
    'trackerDonations',
    'trackerOpenBids',
    'trackerPrizes',
    'twitchChatBotData',
    'twitchStreams',
    'voiceActivity',
    'voiceDelay',
    'songData'
];
const nodecgSpeedcontrolReplicantNames = ['runDataActiveRun', 'runDataArray', 'timer', 'twitchCommercialTimer'];

const assetNames = ['assets:intermissionVideos', 'assets:wideLargeLogos', 'assets:wideSmallLogos', 'assets:squareLogos'];
const replicants: Map<string, NodeCGTypes.ClientReplicant<any>> = new Map();

let playerAlternateInterval: NodeJS.Timeout | null = null;

interface StoreTypes {
    // bingothon
    allGameLayouts: AllGameLayouts;
    allInterviews: AllInterviews;
    allCamNames: AllCamNames;
    bestOfX: BestOfX;
    bingoboard: Bingoboard;
    bingoboardMeta: BingoboardMeta;
    bingoboardMode: BingoboardMode;
    bingosyncSocket: BingosyncSocket;
    capturePositions: CapturePositions;
    currentGameLayout: CurrentGameLayout;
    currentInterview: CurrentInterview;
    currentCamNames: CurrentCamNames;
    currentMainBingoboard: CurrentMainBingoboard;
    discordDelayInfo: DiscordDelayInfo;
    donationTotal: DonationTotal;
    explorationBingoboard: ExplorationBingoboard;
    externalBingoboardMeta: ExternalBingoboardMeta;
    hostingBingoboard: HostBingoCell[][];
    hostingBingosocket: HostingBingosocket;
    hostsSpeakingDuringIntermission: HostsSpeakingDuringIntermission;
    intermissionVideos: IntermissionVideos;
    lastIntermissionTimestamp: LastIntermissionTimestamp;
    obsAudioSources: ObsAudioSources;
    obsConnection: ObsConnection;
    obsDashboardAudioSources: ObsDashboardAudioSources;
    obsAudioLevels: ObsAudioLevels;
    obsPreviewScene: null | string;
    obsCurrentScene: null | string;
    obsPreviewImg: ObsPreviewImg;
    obsSceneList: ObsSceneList;
    obsStreamMode: ObsStreamMode;
    omnibarMessages: OmnibarMessages;
    playBingoSocket: PlayBingoSocket;
    externalBingoboard: ExternalBingoboard;
    showThingsDuringIntermission: ShowThingsDuringIntermission;
    soundOnTwitchStream: SoundOnTwitchStream;
    trackerData: TrackerData;
    trackerDonations: TrackerDonations;
    trackerOpenBids: TrackerOpenBids;
    trackerPrizes: TrackerPrizes;
    twitchChatBotData: TwitchChatBotData;
    twitchStreams: TwitchStream[];
    voiceActivity: VoiceActivity;
    voiceDelay: 0;
    songData: SongData;
    // nodecg-speedcontrol
    runDataActiveRun: RunDataActiveRun;
    runDataArray: RunDataArray;
    timer: Timer;
    twitchCommercialTimer: TwitchCommercialTimer;
    // assets
    'assets:intermissionVideos': Asset[];
    'assets:wideLargeLogos': Asset[];
    'assets:wideSmallLogos': Asset[];
    'assets:squareLogos': Asset[];
    // timer
    playerAlternate: true;
    //firebase
    gameP1: Games;
    gameP2: Games;
    gameP3: Games;
    gameP4: Games;
}

export const store = new Store<StoreTypes>({
    state: {
        // bingothon
        allGameLayouts: [] as AllGameLayouts,
        allInterviews: [] as AllInterviews,
        allCamNames: [] as AllCamNames,
        bestOfX: {} as BestOfX,
        bingoboard: {} as Bingoboard,
        bingoboardMeta: {} as BingoboardMeta,
        bingoboardMode: {} as BingoboardMode,
        bingosyncSocket: {} as BingosyncSocket,
        capturePositions: {} as CapturePositions,
        currentGameLayout: {} as CurrentGameLayout,
        currentInterview: {} as CurrentInterview,
        currentCamNames: {} as CurrentCamNames,
        currentMainBingoboard: {} as CurrentMainBingoboard,
        discordDelayInfo: {} as DiscordDelayInfo,
        donationTotal: 0 as DonationTotal,
        explorationBingoboard: {} as ExplorationBingoboard,
        externalBingoboardMeta: {} as ExternalBingoboardMeta,
        hostingBingoboard: [] as HostBingoCell[][],
        hostingBingosocket: {} as HostingBingosocket,
        hostsSpeakingDuringIntermission: {} as HostsSpeakingDuringIntermission,
        intermissionVideos: {} as IntermissionVideos,
        lastIntermissionTimestamp: 0 as LastIntermissionTimestamp,
        obsAudioLevels: {} as ObsAudioLevels,
        obsAudioSources: {} as ObsAudioSources,
        obsConnection: {} as ObsConnection,
        obsDashboardAudioSources: {} as ObsDashboardAudioSources,
        obsPreviewImg: {} as ObsPreviewImg,
        obsPreviewScene: null as null | string,
        obsCurrentScene: null as null | string,
        obsSceneList: [] as ObsSceneList,
        obsStreamMode: '' as ObsStreamMode,
        omnibarMessages: [] as OmnibarMessages,
        playBingoSocket: {} as PlayBingoSocket,
        externalBingoboard: {} as ExternalBingoboard,
        showThingsDuringIntermission: {} as ShowThingsDuringIntermission,
        soundOnTwitchStream: 0 as SoundOnTwitchStream,
        trackerData: [] as TrackerData,
        trackerDonations: [] as TrackerDonations,
        trackerOpenBids: [] as TrackerOpenBids,
        trackerPrizes: [] as TrackerPrizes,
        twitchChatBotData: {} as TwitchChatBotData,
        twitchStreams: [] as TwitchStream[],
        voiceActivity: {} as VoiceActivity,
        voiceDelay: 0,
        songData: {} as SongData,
        // nodecg-speedcontrol
        runDataActiveRun: {} as RunDataActiveRun,
        runDataArray: [] as RunDataArray,
        timer: {} as Timer,
        twitchCommercialTimer: {} as TwitchCommercialTimer,
        // assets
        'assets:intermissionVideos': [] as Asset[],
        'assets:wideLargeLogos': [] as Asset[],
        'assets:wideSmallLogos': [] as Asset[],
        'assets:squareLogos': [] as Asset[],
        // timer
        playerAlternate: true,
        //firebase
        gameP1: {} as Games,
        gameP2: {} as Games,
        gameP3: {} as Games,
        gameP4: {} as Games
    },
    mutations: {
        updateReplicant(state, { name, value }) {
            set(state, name, value);
        },
        startPlayerAlternateInterval(state, interval) {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = setInterval(() => {
                set(state, 'playerAlternate', !state.playerAlternate);
            }, interval) as unknown as NodeJS.Timeout;
        },
        stopPlayerAlternateInterval() {
            if (playerAlternateInterval) {
                clearInterval(playerAlternateInterval);
            }
            playerAlternateInterval = null;
        },
        ...vuexfireMutations
    },
    actions: {
        bindGameP1: firebaseAction<any, any>(({ bindFirebaseRef }, payload) => {
            // return the promise returned by `bindFirebaseRef` hardcoded for now
            let ref = `games/${payload.gameId || 'floha258'}/items`;
            console.log(ref);
            return bindFirebaseRef('gameP1', db.ref(ref));
        }),
        unbindGameP1: firebaseAction<any, any>(({ unbindFirebaseRef }) => {
            unbindFirebaseRef('gameP1');
        }),
        bindGameP2: firebaseAction<any, any>(({ bindFirebaseRef }, payload) => {
            // return the promise returned by `bindFirebaseRef`
            let ref = `games/${payload.gameId || 'lepelog'}/items`;
            console.log(ref);
            return bindFirebaseRef('gameP2', db.ref(ref));
        }),
        unbindGameP2: firebaseAction<any, any>(({ unbindFirebaseRef }) => {
            unbindFirebaseRef('gameP2');
        }),
        bindGameP3: firebaseAction<any, any>(({ bindFirebaseRef }, payload) => {
            // return the promise returned by `bindFirebaseRef`
            let ref = `games/${payload.gameId || 'cjs07'}/items`;
            console.log(ref);
            return bindFirebaseRef('gameP3', db.ref(ref));
        }),
        unbindGameP3: firebaseAction<any, any>(({ unbindFirebaseRef }) => {
            unbindFirebaseRef('gameP3');
        }),
        bindGameP4: firebaseAction<any, any>(({ bindFirebaseRef }, payload) => {
            // return the promise returned by `bindFirebaseRef`
            let ref = `games/${payload.gameId || 'player4'}/items`;
            console.log(ref);
            return bindFirebaseRef('gameP4', db.ref(ref));
        }),
        unbindGameP4: firebaseAction<any, any>(({ unbindFirebaseRef }) => {
            unbindFirebaseRef('gameP4');
        })
    }
});

store.commit('startPlayerAlternateInterval', 10000);

/**
 * Gets the raw replicant, only intended for modifications, to use values use state
 * @param replicant name of the replicant, throws an error if it isn't found
 */
export function getReplicant<T>(replicant: string): NodeCGTypes.ClientReplicant<T> {
    const rep = replicants.get(replicant);
    if (!rep) {
        throw new Error('invalid replicant!');
    }
    return rep;
}

replicantNames.forEach((name) => {
    const replicant = nodecg.Replicant(name);

    replicant.on('change', (newVal) => {
        store.commit('updateReplicant', {
            name: replicant.name,
            value: clone(newVal)
        });
    });

    replicants.set(name, replicant);
});

nodecgSpeedcontrolReplicantNames.forEach((name) => {
    const rep = nodecg.Replicant(name, 'nodecg-speedcontrol');

    rep.on('change', (newVal) => {
        store.commit('updateReplicant', {
            name: rep.name,
            value: clone(newVal)
        });
    });

    replicants.set(name, rep);
});

assetNames.forEach((name) => {
    const rep = nodecg.Replicant(name);
    rep.on('change', (newValue) => {
        store.commit('updateReplicant', {
            name: rep.name,
            value: clone(newValue)
        });
    });
    replicants.set(name, rep);
});

export async function create() {
    return NodeCG.waitForReplicants(...Array.from(replicants.values())).then(() => store);
}
