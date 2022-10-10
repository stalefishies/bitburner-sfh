import * as S from "sfh";
import * as Netscript from "bb/ScriptEditor/NetscriptDefinitions";

declare global {
    interface NS extends Netscript.NS {}
    type CityName = City;

    type CurrentWork = {
        cyclesWorked: number;
    } & ({
        type: "CRIME";
        crimeType: string;
    } | {
        type: "CLASS";
        classType: string;
        location: string;
    } | {
        type: "CREATE_PROGRAM";
        programName: string;
    } | {
        type: "GRAFTING";
        augmentation: string;
    } | {
        type: "FACTION";
        factionWorkType: string;
        factionName: string;
    } | {
        type: "COMPANY";
        companyName: string;
    } | {
        type: "SYNCHRO"
    } | {
        type: "RECOVERY"
    } | {
        type: "BLADEBURNER"
    } | {
        type: "INFILTRATE"
    } | {
        type: "SUPPORT"
    });

    type Skills    = S.Skills;
    type SkillExp  = S.SkillExp;
    type Person    = S.Person;
    type Player    = S.Player;
    type Sleeve    = S.Sleeve;
    type City      = S.City;
    type Continent = S.Continent;
    type Work      = S.Work;
    type Org       = S.Org;
    type Server    = S.Server;
    type Proc      = S.Proc;
    type Stock     = S.Stock;

    class SFH extends S.SFH {}
    var sfh: SFH;
}
