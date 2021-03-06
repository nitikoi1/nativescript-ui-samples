import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ListViewEventData, RadListView, LoadOnDemandListViewEventData } from "nativescript-ui-listview";
import { Observable } from "tns-core-modules/data/observable";
import { android as androidApplication } from "tns-core-modules/application";

const posts = require("../posts.json");

export class ViewModel extends Observable {
    private _sourceDataItems: ObservableArray<DataItem>;

    constructor() {
        super();
        this.dataItems = new ObservableArray<DataItem>();
        this.initDataItems();
        this.addMoreItemsFromSource(6, null);
    }
    get dataItems(): ObservableArray<DataItem> {
        return this.get("_dataItems");
    }

    set dataItems(value: ObservableArray<DataItem>) {
        this.set("_dataItems", value);
    }

    // >> listview-load-on-demand-handler
    public addMoreItemsFromSource(chunkSize: number, listView: RadListView) {
        let newItems = this._sourceDataItems.splice(0, chunkSize);
        this.dataItems.push(newItems);

        if (listView) {
            // Call the optimized function for on-demand loading finished.
            // (with 0 because the ObservableArray has already
            // notified about the inserted items)
            listView.notifyAppendItemsOnDemandFinished(0, this._sourceDataItems.length === 0);
        }
    }

    public onLoadMoreItemsRequested(args: LoadOnDemandListViewEventData) {
        const that = new WeakRef(this);
        const listView: RadListView = args.object;
        if (this._sourceDataItems.length > 0) {
            setTimeout(function () {
                that.get().addMoreItemsFromSource(20, listView);
            }, 0);
            args.returnValue = true;
        } else {
            args.returnValue = false;
            listView.notifyAppendItemsOnDemandFinished(0, true);
        }
    }

    // << listview-load-on-demand-handler

    private initDataItems() {
        this._sourceDataItems = new ObservableArray<DataItem>();
        // Multiply items in JSON to simulate a far bigger data source
        for (let mult = 0; mult < 100; mult++) {
            for (let i = 0; i < posts.names.length; i++) {
                if (androidApplication) {
                    this._sourceDataItems.push(new DataItem(posts.names[i], posts.titles[i], posts.text[i], "res://" + posts.images[i].toLowerCase()));
                }
                else {
                    this._sourceDataItems.push(new DataItem(posts.names[i], posts.titles[i], posts.text[i], "res://" + posts.images[i]));
                }
            }
        }
    }
}

export class DataItem {
    public name;
    public title;
    public text;
    public image;

    constructor(name: string, title: string, text: string, image: string) {
        this.name = name;
        this.text = text;
        this.title = title;
        this.image = image;
    }
}

