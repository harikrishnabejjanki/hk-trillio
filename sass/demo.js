'use strict';

import React, { Component } from 'react';
import { Share, View, StyleSheet, StatusBar, FlatList, TouchableOpacity, TouchableNativeFeedback, Image, ScrollView, Text, Dimensions, AsyncStorage, Platform, ActivityIndicator, Animated, TouchableHighlight, Alert } from 'react-native';
import CustomHeader from '../customui/CustomHeader';
import CommonHeaderOptions from '../customui/CommonHeaderOptions';
import ColorSingleton from '../screenresolution/ColorSingleton';
const color = ColorSingleton.getInstance();

import LinearGradient from 'react-native-linear-gradient';
import Validations from '../Util/Validation';
import HttpRequestCalls from '../services/HttpRequestCalls';
import Constants from '../Util/Constants';
import AsyncStorageComponent from '../Util/AsyncStorageComponent';
import ProgressBar from '../customui/ProgressBar';
import AppController from '../Util/appController';

var { windowHeight, windowWidth } = Dimensions.get('window');
var _ = require('lodash');

export default class MyCards extends Component {
    validation = new Validations();
    constants = new Constants();
    httpRequest = new HttpRequestCalls();
    storage = new AsyncStorageComponent();

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user_id: '',
            myCardListData: [],
            selectedItemsArray: [],
            selectedEcardsArray: [],
            ecardCount: 0,
            userPackageCount: 0,
            name: '',
            bounceValue: new Animated.Value(100),
            onImageLoading: false
        };
        this.willFocus = this.props.navigation.addListener(
            'willFocus',
            () => {
                if (this.props.navigation.state.params.refreshScreen === 'true') {
                    this.getDetails()
                }
            }
        )

    }

    async deleteMyContacts() {
        const data = {
            user_id: this.state.user_id,
            selectContacts: this.state.selectedEcardsArray
        }
        //console.log(data,"my cards");
        const response = await this.httpRequest.requestPost(data,
            this.constants.deleteMyCardsContactsCode,
            this.constants.deleteMyCardsContacts);

        var tmpdata = this.state.myCardListData;

        for (var i = this.state.selectedItemsArray.length - 1; i >= 0; i--) {
            tmpdata.splice(this.state.selectedItemsArray[i], 1);
        }
        await this.setState({ myCardListData: tmpdata, selectedItemsArray: [], selectedEcardsArray: [] });
        // for (var i = this.state.selectedItemsArray.length -1; i >= 0; i--){
        //     this.state.selectedItemsArray.splice(this.state.selectedItemsArray[i],1);
        //     }
        //     for (var i = this.state.selectedItemsArray.length -1; i >= 0; i--){
        //         this.state.selectedEcardsArray.splice(this.state.selectedItemsArray[i],1);
        //         }
        // console.log(this.state.selectedItemsArray,"selectedItemsArray");
        // console.log(this.state.selectedEcardsArray,"selectedEcardsArray");
        // console.log(this.state.myCardListData,"myCardListData");
        // if (this.state.selectedItemsArray.includes(this.state.selectedItemsArray)) {
        //     this.state.selectedItemsArray.splice(this.state.selectedItemsArray.indexOf(this.state.selectedItemsArray), 1);
        // }  
        //await this.getDetails();

    }
    async startLoading() {
        await this.setState({ loading: true });
    }
    async stopLoading() {
        await this.setState({ loading: false });
    }
    onLongPressButton(index, ecard) {
        //console.log(index,ecard,"ghjgjgh");
        this.selectedContacts(index, ecard);
    }
    selectedContacts(mId, EcardId) {
        if (mId === undefined || mId === null || EcardId === undefined || EcardId === null) {
            alert("Something went wrong");
            return false;
        }

        let selectedItems = this.state.selectedItemsArray;
        let selectEcards = this.state.selectedEcardsArray;
        if (selectedItems.includes(mId)) {
            selectedItems.splice(selectedItems.indexOf(mId), 1);
            selectEcards.splice(selectEcards.indexOf(EcardId), 1);
        } else {
            selectedItems.push(mId)
            selectEcards.push(EcardId)
        }

        this.setState({ selectedItemsArray: selectedItems, selectedEcardsArray: selectEcards });

        var toValue = 0;
        if (this.state.selectedItemsArray.length > 0) {
            toValue = 100;
        }
        //console.log(this.state.selectedItemsArray,this.state.selectedEcardsArray,"selectEcards");
        Animated.spring(
            this.state.bounceValue,
            {
                toValue: toValue,
                velocity: 1,
                tension: 5,
                friction: 8,
            }
        ).start();

    }
    async deleteCard() {
       // if (AppController.restrictMultiClicks() === false) return false;

        if (this.state.selectedEcardsArray.length == 1) {
            const mmdata = {
                user_id: this.state.user_id,
                selectContacts: this.state.selectedEcardsArray
            }
            const mresponse = await this.httpRequest.requestPost(mmdata,
                this.constants.deleteMyCardsContactsCode,
                this.constants.deleteMyCardsAnalatics);
            var cardsOutShared = 0;
            if (mresponse.cardsOutShared.length > 0) {
                if (mresponse.cardsOutShared[0].cardCount)
                    cardsOutShared = mresponse.cardsOutShared[0].cardCount;
            }
            if (cardsOutShared > 0) {
                Alert.alert(
                    'You have shared this card to ' + cardsOutShared + ' members. Are you sure to Delete?',
                    '',
                    [
                        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        { text: 'Yes', onPress: () => this.deleteMyContacts() },
                    ],
                    { cancelable: false }
                )
            } else {
                Alert.alert(
                    'Are you sure to Delete?',
                    '',
                    [
                        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        { text: 'Yes', onPress: () => this.deleteMyContacts() },
                    ],
                    { cancelable: false }
                )
            }
        } else {
            Alert.alert(
                'Are you sure to Delete?',
                '',
                [
                    { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Yes', onPress: () => this.deleteMyContacts() },
                ],
                { cancelable: false }
            )
        }
    }
    async componentWillMount() {

    }
    async componentDidMount() {
        this.getDetails()
    }
    onPressButton(index, eCardId) {
        if (this.state.selectedItemsArray.length > 0) {
            this.selectedContacts(index, eCardId);
        } else {
            this.props.navigation.navigate('Main', {
                user_id: this.state.user_id,
                ecard_id: eCardId
            }
            )

        }
    }
    async getDetails() {
        await this.startLoading();
        var storedObj = await AsyncStorage.getItem('LOGINDETAILS');
        storedObj = JSON.parse(storedObj);
        //console.log(storedObj,"storedObj");
        if (storedObj != null) {
            this.setState({ user_id: storedObj.user_id, name: storedObj.first_name });
            const data = {
                user_id: storedObj.user_id
                //user_id: 72
            };
            const response = await this.httpRequest.requestPost(data, this.constants.MyCardsListCode, this.constants.MyCardsList);
            if (response.statMsg == 'SUCCESS') {
                if (response.ecardCount > 0) {
                    if (response.ecardData === '' || response.ecardData === null || response.ecardData === undefined) {
                        await this.setState({
                            myCardListData: [],
                            ecardCount: response.ecardCount,
                            userPackageCount: response.userPackageCount
                        });
                    } else {
                        await this.setState({
                            myCardListData: response.ecardData,
                            ecardCount: response.ecardCount,
                            userPackageCount: response.userPackageCount
                        });
                    }
                }
            } else {
                AppController.handleResponseFailure(response.statMsg);
            }
            await this.stopLoading();
        }
    }

    gotoback() {
    
        this.props.navigation.navigate('MainDashBoard');
    }

    async sendInviteLink() {
        var urlData = { url: this.constants.inviteUrl }
        //console.log(urlData,"urlData");
        const resp = await this.httpRequest.requestPost(urlData, this.constants.generateShortUrlCode, this.constants.generateShortUrl);

        if (resp.statMsg == 'SUCCESS') {
            if (resp.shortUrl) {
                Share.share({
                    ...Platform.select({
                        ios: {
                            message: "Hi, " + this.state.name + " has sent you IVQ invitation link. Join with IVQ and create your own ecards.",
                            url: resp.shortUrl,
                            title: 'Ivq'
                        },
                        android: {
                            message: 'Hi, ' + this.state.name + ' has sent you IVQ invitation link. Join with IVQ and create your own ecards. \n' + resp.shortUrl,
                            title: 'Ivq'
                        }
                    })
                })
                    .then(result => console.log(result))
                    .catch(err => console.log(err));
            }
        } else {
            AppController.handleResponseFailure(resp.statMsg);
        }

    }


    renderMyCard() {
        //    console.log(this.state.myCardListData,"mydqtttt");
        //     console.log(this.state.selectedItemsArray,"selectedItemsArray");
        //     console.log(this.state.selectedEcardsArray,"selectedEcardsArray");
        return this.state.myCardListData.map((data, key) => {
            console.log('pic>>>>>>', this.constants.assetsUrl + data.profile_picture);
            
            return (
                <View key={key}>
                    {this.state.selectedItemsArray.indexOf(key) !== -1 ?
                        <TouchableHighlight style={styles.layerForContact} onPress={this.onPressButton.bind(this, key, data.ecard_id)}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', paddingRight: 20, paddingTop: 20 }}>
                                    <Image
                                        source={require('../../img/tick.png')}
                                        style={{ height: 30, width: 30, backgroundColor: 'white' }}
                                    />
                                </View>
                            </View>
                        </TouchableHighlight>

                        : null}

                    <TouchableOpacity key={key} onLongPress={this.onLongPressButton.bind(this, key, data.ecard_id)} underlayColor="white" style={{ backgroundColor: '#fff', paddingVertical: 2 }} onPress={this.onPressButton.bind(this, key, data.ecard_id)}>
                        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={color.CardLinerBgColor} style={styles.maCardStyle}>
                            <View style={styles.profImageContStyle}>



                                <View style={{ height: 100, width: 100, zIndex: 2222 }}>
                                    {this.state.onImageLoading ? <View style={[styles.ProgressContainer, styles.horizontal]}>
                                        <ActivityIndicator size="large" color="#0000FF" />
                                    </View> : null}
                                    <Image
                                        onLoadStart={this.onLoadStart.bind(this)}
                                        onLoadEnd={this.onLoadEnd.bind(this)}
                                        source={
                                            (data.profile_picture === '' || data.profile_picture === null || data.profile_picture === undefined) ?
                                                require('../../img/defaultAvator.png') :

                                                { uri: this.constants.assetsUrl + data.profile_picture }
                                        }
                                        style={styles.profImg}
                                    />

                                </View>
                            </View>
                            <View style={styles.cardDetails}>
                                <View style={{ paddingLeft: 2 }}>
                                    <Text style={styles.textStyle1} numberOfLines={1}>{data.first_name + ' ' + data.last_name}</Text>
                                    <Text style={styles.textStyle2} numberOfLines={1}>{data.desg}</Text>
                                    <Text style={styles.textStyle3} numberOfLines={1}>{data.company_name} </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    onUpgradePress() {
        this.setState({selectedItemsArray:[]});
     //   if (AppController.restrictMultiClicks() === false) return false;
        this.props.navigation.navigate(
            {
                routeName: 'UpgradeScreen',
                params: {
                    transition: 'myCustomTransition',
                    transitionType: 'right',
                    fromScreen: 'MyCards'
                }
            }
        )
    }
    onLoadEnd() {

        this.setState({ onImageLoading: false });

    }
    onLoadStart() {

        this.setState({ onImageLoading: true });
    }
    onPlusCardClick(){
        this.setState({selectedItemsArray:[]});
                     
                        this.props.navigation.navigate('Profile', {
                            editFlag: false,
                            user_id: this.state.user_id,
                            ecard_id: null
                        }
                        )
    }
    render() {
        //console.log('log>>>', Dimensions.get('window').height);

        var cardType = 0;
        var totLoopElements;
        //Check user already filled first ecard or not if yes get package degtails and loop through ecards
        if (this.state.userPackageCount > 0 && this.state.ecardCount > 0) {
            totLoopElements = (this.state.userPackageCount + 1) - this.state.ecardCount;
        } else if (this.state.userPackageCount == 0 && this.state.ecardCount > 0) {
            // totLoopElements = 0;
            totLoopElements = 1;
            cardType = 1;
        } else {
            totLoopElements = 1;
        }

        var plusCards = [];
        for (let i = 0; i < totLoopElements; i++) {
            plusCards.push(


                <TouchableOpacity style={styles.freeCardStyle}
                    key={i} onPress={this.onPlusCardClick.bind(this)
                    }
                >
                    <View style={styles.freeCardInnerStyle}>
                        <Image
                            source={require('../../img/NewCard.png')}
                            style={styles.freeImageCardStyle}


                        />
                        <Text style={styles.freeTextStyle}>
                            {cardType == 0 ? "Create FREE Qcardz\u2122" : "Qcardz\u2122"}</Text>

                    </View>
                </TouchableOpacity>

            )
        }
        // console.log(this.state, "selectedItemsArray");
        return (
            <View style={{ flex: 1, zIndex: 111 }}>

                <StatusBar
                    backgroundColor="#000"
                    barStyle="light-content"
                />
                <CustomHeader gotoback={this.gotoback.bind(this)} skipText={false} isBackButtonVisible={true} headerText={'Add/Edit Qcardz\u2122'} />
                <ProgressBar isLoading={this.state.loading} />



                {this.state.loading === false ?
                    <View  >
                        <CommonHeaderOptions onUpgradePress={this.onUpgradePress.bind(this)} sendInviteLink={this.sendInviteLink.bind(this)} />

                        <View style={{ height: Dimensions.get('window').height }}>
                            <ScrollView >
                                <View style={styles.mainContainer}>



                                    <View style={{ width: '100%' }}>
                                        {plusCards}
                                    </View>
                                    {this.renderMyCard()}

                                </View>
                                <View style={{ height: 150 }}></View>
                            </ScrollView>

                        </View>



                    </View>
                    : null}

                {this.state.selectedItemsArray.length > 0 && this.state.myCardListData.length > 0 ?
                    <BottomBar deleteCard={this.deleteCard.bind(this)} />
                    :
                    null
                }

            </View>
        );
    }

}
class BottomBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    deleteCard() {
        if (AppController.restrictMultiClicks() === false) return false;
        this.props.deleteCard();
    }
    workInProgress() {
        alert("work in progress");
    }
    render() {
        return (
            <Animated.View style={styles.bottomBar}>
                <View style={styles.bottomInner}>




                    <TouchableOpacity onPress={this.deleteCard.bind(this)} style={styles.bottomInnerIcons}>
                        <Image
                            source={require('../../img/trash.png')}
                            style={[styles.actionIcon, { right: 4 }]}
                        />
                        <Text style={styles.bIconTxt}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        flexDirection: 'column',
        paddingHorizontal: 15,
        paddingVertical: 5,


    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 10,
    },
    maCardStyle: {
        flexDirection: 'row',
        height: 150,
        borderRadius: 5,
        backgroundColor: '#5185EB',
        shadowColor: '#CCC',
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 2,
        borderColor: '#5185EB',
    },
    myCardImage: {
        height: 150,
        resizeMode: 'contain',
        width: '100%',
        paddingVertical: 10
    },
    profImageContStyle: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Dimensions.get('window').height < 570 ? 10 : 0

    },
    cardDetails: {
        flex: 3.5,

        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column'
    },
    profImg: {
        ...Platform.select({
            ios: {
                height: '100%',
                width: '100%',
                resizeMode: 'contain',
                borderRadius: 50
            },
            android: {
                height: '100%',
                width: '100%',
                resizeMode: 'cover',
                borderRadius: 50

            },
        }),

    },
    textStyle1: {
        fontSize: 20,
        color: '#fff',
        //  fontWeight: 'bold',
        paddingHorizontal: 3,
        fontFamily: color.RobotFontBoldItalic,
    },
    textStyle2: {
        fontSize: 20,
        color: '#fff',
        paddingHorizontal: 3,
        //fontStyle: 'italic',
        fontFamily: color.RobotFontLightItalic,
        fontWeight: '400',
        lineHeight: 32
    },
    textStyle3: {
        fontSize: 20,
        paddingHorizontal: 3,
        color: '#fff',
        fontWeight: '500',
        fontFamily: color.RobotFontLightItalic,
    },
    freeCardStyle: {
        height: 150,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        backgroundColor: color.freeCardStyle,
        paddingBottom: 5,
        borderRadius: 5,
        alignSelf: 'stretch',
        marginBottom: 10
    },
    freeImageCardStyle: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        fontFamily: color.RobotFontItalic,

    },
    freeCardInnerStyle: {
        width: '100%',
        height: 80,
        alignItems: 'baseline',
        flexDirection: 'row',
        marginLeft: 30
    },
    freeTextStyle: {
        fontSize: (Dimensions.get('window').height > 570) ? 19 : 16,
        color: '#FFFFFF',
        alignSelf: 'flex-end',
        fontWeight: '500',
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontFamily: color.RobotFontItalic,

    },
    ProgressContainer: {
        flex: 1,
        justifyContent: 'center',
        position: 'absolute',
        zIndex: 9999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    layerForContact: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        left: 0,
        right: 0,
        position: 'absolute',
        top: 0,
        bottom: 0,
        zIndex: 9999,
        borderWidth: 1,
        borderBottomColor: '#e6e6e6'
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        height: 70,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderTopWidth: 1,
        borderColor: '#65C3FA',
        //backgroundColor: 'red'
    },
    bottomInner: {
        flex: 1,
        flexDirection: 'row',

    },
    bottomInnerIcons: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flex: 1,
        right: 25
        // borderRightWidth: 1,
        // borderColor: '#ccc'
    },
    actionIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    bIconTxt: {
        fontSize: 16,
        fontFamily: color.RobotFontRegular,
        fontWeight: '400',
        color: '#4C94DB',
        paddingTop: 5
    },
});