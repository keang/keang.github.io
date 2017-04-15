---
layout: post
title:  "Recurrent Neural Network World Greeting Example"
date:   2017-04-14 11:02:00 +0800
categories: machine-learning
comments: true
jsarr:
- javascripts/rnn-example.js
---

Recurrent Neural Network is a flavour of a mathematical model that is able to do many fascinating things.
You can find very [well-written explanation here](http://colah.github.io/posts/2015-08-Understanding-LSTMs/) and [more examples here](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)

I have put together a simple hello-world example of training an RNN model, to predict a time-series using [Tensorflow](https://www.tensorflow.org/): https://github.com/bernoullio/rnn-example

The example uses tensorflow 1.0.0:

  - our RNN graph is put together in `rnn/model`,
  - with some config variable extracted to a config yaml.
  - the config.yaml defines some model parameters, as well as where to read the data, label, etc.
  - a few configuration is stored in the `configs/` directory
  - `trainer.py` takes care of reading all config files, train on 80% of the data, and try to predict the last 20%
  - the prediction are saved to `outputs/` directory

You are free to fork and test out different configs, different data series, etc. Sharing is caring!

# The task

Once again, the task is to predict the last 20% of a series, by looking only at the first 80%.

I've generated a simple one using modulus, combination of sinh and tanh  on a spreadsheet (unfortunately I've lost the original formula). It looks like below:

<div id="series"></div>

While we can only use the first 80% of the data, we can run many many iterations (epochs) over the training data to continue to improve the cost function. The number of epochs is also configurable in the yaml file.

The cost function here, for simplicity, is Mean Squared Error (MSE).

The following are some example configs and their results:


# What params can be configured?

Configuration yaml's in `configs/` directory can include a number of variables, as explained below:

<script src="http://gist-it.appspot.com/https://github.com/bernoullio/rnn-example/blob/master/configs/base.yaml"></script>

# Tweaking `rnn_layer`

The following section illustrates how varying the RNN architecture, the `rnn_layer` variable in the yaml (which is basically how many cells per layer, how many layer, etc.) affect the prediction power. The last 20% values are plotted against the predicted values.

### Basic
This is the configuration example found above; basic model architecture: 1 layer of 5 LSTM cells.

<div id="base_graph"></div>

### Wide
A single RNN layer with many many LSTM cells. This allows the network to inch closer to the targets.

<script src="http://gist-it.appspot.com/https://github.com/bernoullio/rnn-example/blob/master/configs/wide.yaml"></script>
<div id="wide_graph"></div>

### Deep
A few layers of narrow RNN layers. Er, this time it seems the network didn't even try.
<script src="http://gist-it.appspot.com/https://github.com/bernoullio/rnn-example/blob/master/configs/deep.yaml"></script>
<div id="deep_graph"></div>

### Long
If we increase the variable `time_steps` so that more steps are bundled together as input for each (X, y) pair, we get a much better prediction. I found that matching the number of RNN cells with the number of steps gives good result:
<script src="http://gist-it.appspot.com/https://github.com/bernoullio/rnn-example/blob/master/configs/long.yaml"></script>
<div id="long_graph"></div>

# What next?
There are actually a lot more parameters than just the RNN architechture that can be tweaked, but not illustrated here. Go ahead, clone/fork [the repo](https://github.com/bernoullio/rnn-example) and have fun!
