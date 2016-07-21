/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.snowdropsolutions.tt.services;

import com.google.appengine.api.modules.ModulesServiceFactory;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;
import java.util.Map;
import java.util.Map.Entry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 *
 * @author ffarrabal
 */
@Service
public class TaskQueueService {

    @Value("${tt.tasks.version}")
    private String version;

    /**
     *
     * @param url the url
     * @param params the params
     */
    public void registerTaskQueue(String url, Map<String, Object> params) {
        //Create Task Queue in other instance
        String module = ModulesServiceFactory.getModulesService().getCurrentModule();
        String hostName = ModulesServiceFactory.getModulesService().getVersionHostname(module, version);

        TaskOptions options = TaskOptions.Builder.withUrl(url);
        for (Entry<String, Object> param : params.entrySet()) {
            options.param(param.getKey(), param.getValue().toString());
        }
        Queue queue = QueueFactory.getDefaultQueue();
        queue.addAsync(options.header("Host", hostName));

    }
}
