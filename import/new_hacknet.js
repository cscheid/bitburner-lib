/** @param {NS} ns **/

// import * as utils from "./utils.ns";
import freeUtils from "/lib/free.js";

function getOptions(ns) {
    let options = [{
        doIt: () => ns.hacknet.purchaseNode(),
        cost: ns.hacknet.getPurchaseNodeCost(),
        what: `purchase new node`,
        name: "$newnode",
        node: -1
    }];
    // pprint(ns.hacknet.numNodes());
    for (let i = 0; i < ns.hacknet.numNodes(); ++i) {
        let info = ns.hacknet.getNodeStats(i);

        options.push({
            doIt: ((i) => async () => await ns.hacknet.upgradeLevel(i, 1))(i),
            cost: ns.hacknet.getLevelUpgradeCost(i, 1),
            what: `Upgrade level on node ${i}`,
            name: `level-${i}`,
            node: i
        }, {
            doIt: ((i) => async () => await ns.hacknet.upgradeRam(i, 1))(i),
            cost: ns.hacknet.getRamUpgradeCost(i, 1),
            what: `Upgrade ram on node ${i}`,
            name: `ram-${i}`,
            node: i
        }, {
            doIt: ((i) => async () => await ns.hacknet.upgradeCore(i, 1))(i),
            cost: ns.hacknet.getCoreUpgradeCost(i, 1),
            what: `Upgrade core on node ${i}`,
            name: `core-${i}`,
            node: i
        });
    }
    return options;
}

async function manageBuying(ns) {
    let input = await ns.read("/data/hacknet-rewards.txt");
    // ns.tprint(input);
    let rewards = JSON.parse(input);
    let stopped = false;

    while (true) {
        let options = getOptions(ns);
        options.forEach(option => {
            if (rewards[option.name] === undefined) {
                rewards[option.name] = {
                    node: option.node,
                    productionDelta: 1e30,
                    cost: option.cost,
                    action: option.doIt,
                    name: option.name,
                    what: option.what
                };
            } else {
                rewards[option.name].cost = option.cost;
                rewards[option.name].action = option.doIt;
                rewards[option.name].what = option.what;
            }
        });
        let rewList = Object.values(rewards).filter(v => v.cost !== null);
        rewList.sort((a, b) => (b.productionDelta / b.cost - a.productionDelta / a.cost));

        if (rewList.length === 0) {
            ns.tprint("No more options, hacknet done!");
            await ns.write("/data/hacknet-rewards.txt", JSON.stringify(rewards, null, 2), "w");
            break;
        }
        let bestReward = rewList[0];
        let currentProduction;
        if (bestReward.node === -1) {
            currentProduction = 0;
        } else {
            // ns.tprint(bestReward);
            currentProduction = ns.hacknet.getNodeStats(bestReward.node).production;
        }

        if (ns.getServerMoneyAvailable("home") > bestReward.cost) {
            stopped = false;
            ns.tprint(bestReward.what);
            await bestReward.action();
            await ns.sleep(100);
            let newProduction;
            if (bestReward.node === -1) {
                let latestNode = ns.hacknet.numNodes() - 1;
                newProduction = ns.hacknet.getNodeStats(latestNode).production;
            } else {
                newProduction = ns.hacknet.getNodeStats(bestReward.node).production;
            }

            bestReward.productionDelta = newProduction - currentProduction;
            await ns.write("/data/hacknet-rewards.txt", JSON.stringify(rewards, null, 2), "w");
        } else {
            if (!stopped)
                ns.tprint(`would ${bestReward.what} but not rich enough. Waiting.`);
            stopped = true;
            await ns.sleep(1000);
        }
        
    }
}

/** @param {NS} ns */
export async function main(ns) {
    await manageBuying(ns);
}
