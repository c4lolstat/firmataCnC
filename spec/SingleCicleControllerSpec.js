/**
 * Created by Farkas on 2015.09.12..
 */
"use strict";

var Driver = require("../components/SingleCicleController.js");

describe('In single cicle controller', function () {
    var driver;
    var dummyPort;

    beforeEach(function () {
        driver = Object.create(Driver.Controller).setup();
        dummyPort = {
            run: false,
            nextPosition: 0,
            state: 'undefined',
            lastStep: 3,
            position: 10,
            length: 100,
            axisSteps: 0,
            dl:1
        };
        driver.addAxis(dummyPort);
    });

    it('should setup properly', function () {
        expect(driver.loop).toBeDefined();
        expect(driver.ports).toBeDefined();
        expect(driver.eventEmitter).toBeDefined();
        expect(driver.stepTime).toBeGreaterThan(10);
        expect(driver.near.length).toEqual(3);
        expect(driver.far.length).toEqual(3)
    });

    it('should add axis represented as object', function () {
        expect(driver.ports.length).toEqual(1);
    });

    it('should set port properly', function () {
        driver.setPort1(10);
        expect(driver.ports[0].run).toBe(true);
        expect(driver.ports[0].nextPosition).toEqual(10);
    });

    it('should call mainloop when init called', function () {
        spyOn(driver, 'mainLoop');
        spyOn(driver, 'enableRunningPorts');
        driver.init();
        expect(driver.enableRunningPorts).toHaveBeenCalled();
        expect(driver.mainLoop).toHaveBeenCalled();
    });

    it('should call mainloop when execute called', function () {
        spyOn(driver, 'mainLoop');
        spyOn(driver, 'enableRunningPorts');
        driver.execute();
        expect(driver.enableRunningPorts).toHaveBeenCalled();
        expect(driver.mainLoop).toHaveBeenCalled();
    });

    describe('when axis in undefined state', function () {
        beforeEach(function () {
            driver = Object.create(Driver.Controller).setup();
            dummyPort = {
                run: false,
                nextPosition: 0,
                state: 'undefined',
                lastStep: 3,
                position: 10,
                length: 100,
                axisSteps: 0
            }
            driver.addAxis(dummyPort);
        });
        describe('and far not reached', function () {
            it('should step properly', function () {
                expect(driver.ports[0].lastStep).toEqual(3);
                driver.handleUndefinedState(0);
                expect(driver.ports[0].lastStep).toEqual(2);
                driver.handleUndefinedState(0);
                expect(driver.ports[0].lastStep).toEqual(1);
                driver.handleUndefinedState(0);
                expect(driver.ports[0].lastStep).toEqual(0);
                driver.handleUndefinedState(0);
                expect(driver.ports[0].lastStep).toEqual(3);
            });
        });
        describe('and far reached', function () {
            it('it should change state', function () {
                driver.far[0] = 0;
                driver.handleUndefinedState(0);
                expect(driver.ports[0].state).toEqual('initStart');
            });
        });
    });

    describe('when axis in initStart state', function () {
        describe('and near not reached', function () {
            beforeEach(function () {
                driver = Object.create(Driver.Controller).setup();
                dummyPort = {
                    run: false,
                    nextPosition: 0,
                    state: 'initStart',
                    lastStep: 3,
                    position: 10,
                    length: 100,
                    axisSteps: 0
                }
                driver.addAxis(dummyPort);
            });

            it('should step properly', function () {
                expect(driver.ports[0].lastStep).toEqual(3);
                driver.handleInitStartState(0);
                expect(driver.ports[0].lastStep).toEqual(0);
                driver.handleInitStartState(0);
                expect(driver.ports[0].lastStep).toEqual(1);
                driver.handleInitStartState(0);
                expect(driver.ports[0].lastStep).toEqual(2);
                driver.handleInitStartState(0);
                expect(driver.ports[0].lastStep).toEqual(3);
                expect(driver.ports[0].axisSteps).toEqual(4);
            });
        });

        describe('and near reached', function () {
            beforeEach(function () {
                driver = Object.create(Driver.Controller).setup();
                dummyPort = {
                    run: false,
                    nextPosition: 0,
                    state: 'initStart',
                    lastStep: 3,
                    position: 10,
                    length: 100,
                    axisSteps: 0
                }
                driver.addAxis(dummyPort);
                driver.near[0] = 0;
            });

            it('it should change state', function () {
                driver.handleInitStartState(0);
                expect(driver.ports[0].state).toEqual('initialized');
            });

            it('it should change run to false', function () {
                expect(driver.ports[0].run).toBe(false);
            });

            it('it should zero positions', function () {
                driver.handleInitStartState(0);
                expect(driver.ports[0].position).toEqual(0);
                expect(driver.ports[0].nextPosition).toEqual(0);
            });

            it('it should calculate dl', function () {
                driver.ports[0].axisSteps = 10;
                driver.handleInitStartState(0);
                expect(driver.ports[0].dl).toEqual(10);
            });
        });
    });

    describe('when axis in initialized state', function () {
        beforeEach(function () {
            driver = Object.create(Driver.Controller).setup();
            dummyPort = {
                run: false,
                nextPosition: 10,
                state: 'initialized',
                lastStep: 3,
                position: 9.8,
                length: 30,
                axisSteps: 200,
                dl: 1
            };
            driver.addAxis(dummyPort);
        });

        it('should step properly when position > nextPosition', function () {
            driver.ports[0].nextPosition = 5;
            expect(driver.ports[0].lastStep).toEqual(3);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(0);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(1);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(2);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(3);
        });

        it('should step properly when position < nextPosition', function () {
            driver.ports[0].nextPosition = 20;
            expect(driver.ports[0].lastStep).toEqual(3);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(2);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(1);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(0);
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(3);
        });

        it('should stop when close enough', function () {
            driver.handleInitializedState(0);
            expect(driver.ports[0].run).toBe(false);
            expect(driver.ports[0].nextPosition).toEqual(10);
        });

        it('should not go below zero position', function () {
            driver.ports[0].nextPosition = -5;
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(3);
            expect(driver.ports[0].run).toBe(false);
        });

        it('should not go further then axis length', function () {
            driver.ports[0].nextPosition = 220;
            driver.handleInitializedState(0);
            expect(driver.ports[0].lastStep).toEqual(3);
            expect(driver.ports[0].run).toBe(false);
        });
    });

});